"""
Stress testing scenarios
High-load testing to find system limits and performance bottlenecks
"""

from locust import HttpUser, task, between
from locust.exception import RescheduleTask
import random
import sys
import os

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GRAPHQL_QUERIES, GRAPHQL_HEADERS, ENDPOINTS


class StressTestUser(HttpUser):
    """
    High-frequency user for stress testing
    """
    wait_time = between(0.01, 0.1)  # Very fast requests
    
    def on_start(self):
        """Called when a user starts"""
        self.graphql_endpoint = ENDPOINTS["graphql"]
        self.headers = GRAPHQL_HEADERS
        self.request_count = 0
    
    def graphql_request(self, query, name):
        """Helper to make GraphQL requests"""
        payload = {"query": query}
        response = self.client.post(
            self.graphql_endpoint,
            json=payload,
            headers=self.headers,
            name=name
        )
        
        self.request_count += 1
        
        if response.status_code != 200:
            print(f"GraphQL request failed: {response.status_code} - {response.text}")
            raise RescheduleTask()
        
        return response.json()
    
    @task(10)
    def rapid_fire_mixed_queries(self):
        """
        Rapid fire mixed queries to stress test all endpoints
        """
        queries = [
            ("getUser", GRAPHQL_QUERIES["getUser"]),
            ("getProduct", GRAPHQL_QUERIES["getProduct"]),
            ("getPayment", GRAPHQL_QUERIES["getPayment"]),
            ("getUserPayment", GRAPHQL_QUERIES["getUserPayment"])
        ]
        
        # Execute a random query
        query_name, query = random.choice(queries)
        self.graphql_request(
            query=query,
            name=f"Stress: {query_name}"
        )
    
    @task(5)
    def burst_requests(self):
        """
        Send burst of requests to simulate traffic spikes
        """
        # Send 3-5 requests in quick succession
        burst_size = random.randint(3, 5)
        for _ in range(burst_size):
            query_name = random.choice(["getUser", "getProduct", "getPayment"])
            self.graphql_request(
                query=GRAPHQL_QUERIES[query_name],
                name=f"Burst: {query_name}"
            )
    
    @task(3)
    def request_scoped_service_stress(self):
        """
        Stress test the request-scoped service (getUserPayment)
        """
        self.graphql_request(
            query=GRAPHQL_QUERIES["getUserPayment"],
            name="Stress: getUserPayment (req-scoped)"
        )
    
    @task(1)
    def rest_endpoint_stress(self):
        """
        Also stress test the REST endpoint
        """
        self.client.get(ENDPOINTS["rest"], name="Stress: REST Hello World")


class HeavyLoadUser(HttpUser):
    """
    User that creates heavy load with complex request patterns
    """
    wait_time = between(0.05, 0.2)
    
    def on_start(self):
        """Called when a user starts"""
        self.graphql_endpoint = ENDPOINTS["graphql"]
        self.headers = GRAPHQL_HEADERS
    
    def graphql_request(self, query, name):
        """Helper to make GraphQL requests"""
        payload = {"query": query}
        response = self.client.post(
            self.graphql_endpoint,
            json=payload,
            headers=self.headers,
            name=name
        )
        
        if response.status_code != 200:
            print(f"GraphQL request failed: {response.status_code} - {response.text}")
            raise RescheduleTask()
        
        return response.json()
    
    @task(1)
    def complex_workflow_stress(self):
        """
        Complex workflow that hits all endpoints in sequence
        """
        # Hit all endpoints in quick succession
        workflows = [
            ("getUser", "getProduct", "getPayment"),
            ("getProduct", "getUser", "getUserPayment"),
            ("getPayment", "getUserPayment", "getUser"),
            ("getUserPayment", "getProduct", "getPayment")
        ]
        
        workflow = random.choice(workflows)
        for query_name in workflow:
            self.graphql_request(
                query=GRAPHQL_QUERIES[query_name],
                name=f"HeavyLoad: {query_name}"
            )


# Command to run this scenario:
# locust -f locust/scenarios/stress_test.py --host=http://localhost:3000 
