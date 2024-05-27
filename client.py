import zmq
import threading

def receive_messages():
    while True:
        message = sub_socket.recv_string()
        print(f"Received: {message}")

context = zmq.Context()

# Create a socket to send messages to the broker
pub_socket = context.socket(zmq.PUB)
pub_socket.connect("tcp://localhost:5555")

# Create a socket to receive messages from the broker
sub_socket = context.socket(zmq.SUB)
sub_socket.connect("tcp://localhost:5556")
sub_socket.setsockopt_string(zmq.SUBSCRIBE, "")

# Start a thread to receive messages
receive_thread = threading.Thread(target=receive_messages)
receive_thread.start()

while True:
    message = input("Enter message: ")
    pub_socket.send_string(message)
