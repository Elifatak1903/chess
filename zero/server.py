import zmq
import threading

def broker():
    context = zmq.Context()

    # Create a socket to receive messages from clients
    frontend = context.socket(zmq.SUB)
    frontend.bind("tcp://*:5555")
    frontend.setsockopt_string(zmq.SUBSCRIBE, "")

    # Create a socket to send messages to clients
    backend = context.socket(zmq.PUB)
    backend.bind("tcp://*:5556")

    zmq.device(zmq.FORWARDER, frontend, backend)

if __name__ == "__main__":
    broker_thread = threading.Thread(target=broker)
    broker_thread.start()

