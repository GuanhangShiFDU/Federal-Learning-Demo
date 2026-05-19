import secretflow as sf
import numpy as np


def make_data(seed: int, n: int = 200):
    np.random.seed(seed)
    x = np.random.randn(n, 2)
    true_w = np.array([2.0, -3.0])
    y = (x @ true_w + 0.5 > 0).astype(np.float32)
    return x, y


def sigmoid(z):
    return 1 / (1 + np.exp(-z))


def local_train(data, w, b, lr=0.3):
    x, y = data

    pred = sigmoid(x @ w + b)
    err = pred - y

    grad_w = x.T @ err / len(y)
    grad_b = np.mean(err)

    new_w = w - lr * grad_w
    new_b = b - lr * grad_b

    loss = -np.mean(
        y * np.log(pred + 1e-8)
        + (1 - y) * np.log(1 - pred + 1e-8)
    )

    return new_w, new_b, float(loss)


def run_secretflow_demo(rounds: int = 10):
    sf.init(parties=["alice", "bob"], address="local")

    try:
        alice = sf.PYU("alice")
        bob = sf.PYU("bob")

        alice_data = alice(make_data)(seed=1)
        bob_data = bob(make_data)(seed=2)

        w = np.zeros(2)
        b = 0.0

        logs = []

        for round_id in range(rounds):
            alice_result = alice(local_train)(alice_data, w, b)
            bob_result = bob(local_train)(bob_data, w, b)

            aw, ab, aloss = sf.reveal(alice_result)
            bw, bb, bloss = sf.reveal(bob_result)

            w = (aw + bw) / 2
            b = (ab + bb) / 2
            avg_loss = (aloss + bloss) / 2

            logs.append({
                "round": round_id,
                "alice_loss": round(aloss, 4),
                "bob_loss": round(bloss, 4),
                "avg_loss": round(avg_loss, 4),
            })

        return {
            "status": "success",
            "message": "SecretFlow local simulation completed.",
            "logs": logs,
            "final_w": [float(x) for x in w],
            "final_b": float(b),
        }

    finally:
        sf.shutdown()
