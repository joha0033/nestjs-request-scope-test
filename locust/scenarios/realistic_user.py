"""
Realistic user behavior scenarios
Simulates real user workflows with multiple related queries
"""

from locust import HttpUser, task, between
from locust.exception import RescheduleTask
import random
import time
import sys
import os

# Add parent directory to path to import config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import GRAPHQL_QUERIES, GRAPHQL_HEADERS, ENDPOINTS


class RealisticUser(HttpUser):
    """
    Simulates realistic user behavior patterns
    """
    wait_time = between(2, 8)  # Realistic thinking time between actions
    
    def on_start(self):
        """Called when a user starts"""
        self.graphql_endpoint = ENDPOINTS["graphql"]
        self.headers = GRAPHQL_HEADERS
        self.user_session = {
            "logged_in": False,
            "viewed_products": [],
            "has_payment_info": False
        }
    
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
    
    @task(8)
    def browse_and_view_products(self):
        """
        Common user behavior: browse products
        """
        # First time users often check user info
        if not self.user_session["logged_in"]:
            self.graphql_request(
                query=GRAPHQL_QUERIES["getUser"],
                name="Browse: getUser (first time)"
            )
            self.user_session["logged_in"] = True
        
        # View products
        self.graphql_request(
            query=GRAPHQL_QUERIES["getProduct"],
            name="Browse: getProduct"
        )
        
        # Track that user viewed products
        self.user_session["viewed_products"].append("product_" + str(random.randint(1, 100)))
    
    @task(5)
    def user_account_check(self):
        """
        User checks their account information
        """
        # Get user info
        self.graphql_request(
            query=GRAPHQL_QUERIES["getUser"],
            name="Account: getUser"
        )
        
        # Sometimes check payment info too
        if random.random() < 0.6:
            self.graphql_request(
                query=GRAPHQL_QUERIES["getPayment"],
                name="Account: getPayment"
            )
            self.user_session["has_payment_info"] = True
    
    @task(3)
    def shopping_workflow(self):
        """
        Complete shopping workflow simulation
        """
        # Step 1: Get user info
        self.graphql_request(
            query=GRAPHQL_QUERIES["getUser"],
            name="Shopping: getUser"
        )
        
        # Step 2: Browse products (multiple views)
        for i in range(random.randint(1, 3)):
            self.graphql_request(
                query=GRAPHQL_QUERIES["getProduct"],
                name="Shopping: getProduct"
            )
            time.sleep(random.uniform(0.5, 2))  # View time
        
        # Step 3: Check payment info before purchase
        if random.random() < 0.8:  # 80% check payment
            self.graphql_request(
                query=GRAPHQL_QUERIES["getUserPayment"],
                name="Shopping: getUserPayment"
            )
    
    @task(2)
    def quick_check(self):
        """
        Quick user or product check
        """
        if random.random() < 0.7:
            self.graphql_request(
                query=GRAPHQL_QUERIES["getUser"],
                name="Quick: getUser"
            )
        else:
            self.graphql_request(
                query=GRAPHQL_QUERIES["getProduct"],
                name="Quick: getProduct"
            )
    
    @task(1)
    def payment_focused_session(self):
        """
        User focused on payment/account management
        """
        # Get user info first
        self.graphql_request(
            query=GRAPHQL_QUERIES["getUser"],
            name="Payment: getUser"
        )
        
        # Check payment methods
        self.graphql_request(
            query=GRAPHQL_QUERIES["getPayment"],
            name="Payment: getPayment"
        )
        
        # Check user payment integration
        self.graphql_request(
            query=GRAPHQL_QUERIES["getUserPayment"],
            name="Payment: getUserPayment"
        )


# Command to run this scenario:
# locust -f locust/scenarios/realistic_user.py --host=http://localhost:3000 
