"""
Single query performance testing
This mirrors the existing autocannon benchmarks but with Locust's features
"""

from locust import HttpUser, task, between
from locust.exception import RescheduleTask
import sys
import os

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GRAPHQL_QUERIES, GRAPHQL_HEADERS, ENDPOINTS


class SingleQueryUser(HttpUser):
    """
    Focus on individual query performance - similar to autocannon benchmarks
    """
    wait_time = between(0.1, 0.5)  # Fast requests like autocannon
    
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
    def get_user(self):
        """Test getUser query - highest frequency like autocannon"""
        self.graphql_request(
            query=GRAPHQL_QUERIES["getUser"],
            name="getUser"
        )
    
    @task(1)
    def get_product(self):
        """Test getProduct query"""
        self.graphql_request(
            query=GRAPHQL_QUERIES["getProduct"],
            name="getProduct"
        )
    
    @task(1)
    def get_payment(self):
        """Test getPayment query"""
        self.graphql_request(
            query=GRAPHQL_QUERIES["getPayment"],
            name="getPayment"
        )
    
    @task(1)
    def get_user_payment(self):
        """Test getUserPayment query - request-scoped service"""
        self.graphql_request(
            query=GRAPHQL_QUERIES["getUserPayment"],
            name="getUserPayment"
        )


# Command to run this scenario:
# locust -f locust/scenarios/single_query.py --host=http://localhost:3000 
