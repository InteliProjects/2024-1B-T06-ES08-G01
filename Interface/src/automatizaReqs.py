import requests
import time
import random
from threading import Thread

def make_request():
    id = random.randint(1, 10)
    response = requests.get(f"http://localhost:5050/readFile/{id}")
    print(f"Response from ID {id}: {response.status_code}")

def scenario_1():
    print("Scenario 1: One request per second for 10 seconds")
    for _ in range(10):
        make_request()
        time.sleep(1)

def scenario_2():
    print("Scenario 2: Five simultaneous requests")
    threads = []
    for _ in range(5):
        thread = Thread(target=make_request)
        threads.append(thread)
        thread.start()
    for thread in threads:
        thread.join()

def scenario_3():
    print("Scenario 3: One request every 1.5 seconds for 60 seconds")
    start_time = time.time()
    while time.time() - start_time < 60:
        make_request()
        time.sleep(1.5)

def scenario_4():
    print("Scenario 4: One request every 5 seconds for 300 seconds")
    start_time = time.time()
    while time.time() - start_time < 300:
        make_request()
        time.sleep(5)

if __name__ == "__main__":
    scenario_1()
    scenario_2()
    scenario_3()
    scenario_4()
