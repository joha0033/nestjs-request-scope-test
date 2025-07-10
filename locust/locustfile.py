"""
Locust load testing configuration for NestJS GraphQL API
This complements the existing autocannon benchmarks with more advanced scenarios
"""

import json
import random
from locust import HttpUser, task, between, events
from locust.exception import RescheduleTask


class GraphQLUser(HttpUser):
    """
    Base user class for GraphQL API testing
    """
    wait_time = between(1, 3)  # Wait 1-3 seconds between requests
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.graphql_endpoint = "/graphql"
        self.headers = {"Content-Type": "application/json"}
    
    def graphql_request(self, query, variables=None, name=None):
        """
        Helper method to make GraphQL requests
        """
        payload = {"query": query}
        if variables:
            payload["variables"] = variables
            
        response = self.client.post(
            self.graphql_endpoint,
            json=payload,
            headers=self.headers,
            name=name or f"GraphQL: {query.split('{')[1].split('}')[0].strip()}"
        )
        
        if response.status_code != 200:
            print(f"GraphQL request failed: {response.status_code} - {response.text}")
            raise RescheduleTask()
            
        return response.json()


class SingleQueryUser(GraphQLUser):
    """
    User that focuses on single query performance testing
    Similar to existing autocannon benchmarks but with more realistic timing
    """
    
    @task(4)
    def get_user(self):
        """Test the getUser query"""
        self.graphql_request(
            query="{ getUser }",
            name="getUser"
        )
    
    @task(3)
    def get_product(self):
        """Test the getProduct query"""
        self.graphql_request(
            query="{ getProduct }",
            name="getProduct"
        )
    
    @task(2)
    def get_payment(self):
        """Test the getPayment query"""
        self.graphql_request(
            query="{ getPayment }",
            name="getPayment"
        )
    
    @task(1)
    def get_user_payment(self):
        """Test the getUserPayment query (request-scoped service)"""
        self.graphql_request(
            query="{ getUserPayment }",
            name="getUserPayment"
        )


class RealisticUserBehavior(GraphQLUser):
    """
    Simulates realistic user behavior with multiple related queries
    """
    
    @task(5)
    def user_workflow(self):
        """
        Simulate a user browsing products and checking their payment info
        """
        # First, get user info
        user_response = self.graphql_request(
            query="{ getUser }",
            name="UserWorkflow: getUser"
        )
        
        # Then browse products
        product_response = self.graphql_request(
            query="{ getProduct }",
            name="UserWorkflow: getProduct"
        )
        
        # Check payment info (50% chance)
        if random.random() < 0.5:
            payment_response = self.graphql_request(
                query="{ getPayment }",
                name="UserWorkflow: getPayment"
            )
    
    @task(3)
    def checkout_simulation(self):
        """
        Simulate a checkout process
        """
        # Get user info
        self.graphql_request(
            query="{ getUser }",
            name="Checkout: getUser"
        )
        
        # Get product info
        self.graphql_request(
            query="{ getProduct }",
            name="Checkout: getProduct"
        )
        
        # Get user payment info (request-scoped service test)
        self.graphql_request(
            query="{ getUserPayment }",
            name="Checkout: getUserPayment"
        )


class StressTestUser(GraphQLUser):
    """
    High-frequency user for stress testing
    """
    wait_time = between(0.1, 0.5)  # Very fast requests
    
    @task(1)
    def rapid_fire_queries(self):
        """
        Rapid fire requests to test system limits
        """
        queries = [
            "{ getUser }",
            "{ getProduct }",
            "{ getPayment }",
            "{ getUserPayment }"
        ]
        
        # Execute a random query
        query = random.choice(queries)
        self.graphql_request(
            query=query,
            name=f"StressTest: {query.split('{')[1].split('}')[0].strip()}"
        )


class RESTUser(HttpUser):
    """
    Test the REST endpoint as well
    """
    wait_time = between(2, 5)
    
    @task(1)
    def test_hello_world(self):
        """Test the REST endpoint"""
        self.client.get("/", name="REST: Hello World")


# Event listeners for custom metrics
@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    print("🚀 Locust load test starting...")
    print(f"Testing GraphQL endpoint: {environment.host}/graphql")
    print(f"Testing REST endpoint: {environment.host}/")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    print("🏁 Locust load test completed!")
    print(f"Total requests: {environment.stats.total.num_requests}")
    print(f"Total failures: {environment.stats.total.num_failures}")
    print(f"Average response time: {environment.stats.total.avg_response_time:.2f}ms")


# Different user classes for different scenarios
# Use with: locust --users 10 --spawn-rate 2 --run-time 60s 
