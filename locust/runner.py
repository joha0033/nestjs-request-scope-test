#!/usr/bin/env python3
"""
Locust test runner
Easily run different load testing scenarios
"""

import subprocess
import sys
import os
import argparse
from config import CONFIGS, DEFAULT_HOST


def run_locust_test(scenario, config_name="standard", host=None):
    """
    Run a specific Locust test scenario
    """
    if config_name not in CONFIGS:
        print(f"❌ Unknown config: {config_name}")
        print(f"Available configs: {list(CONFIGS.keys())}")
        return False
    
    config = CONFIGS[config_name]
    target_host = host or DEFAULT_HOST
    
    print(f"🚀 Running Locust test: {scenario}")
    print(f"📊 Config: {config['description']}")
    print(f"🎯 Target: {target_host}")
    print(f"👥 Users: {config['users']}")
    print(f"⚡ Spawn rate: {config['spawn_rate']}")
    print(f"⏱️  Duration: {config['run_time']}")
    print()
    
    cmd = [
        "locust",
        "-f", scenario,
        "--host", target_host,
        "--users", str(config['users']),
        "--spawn-rate", str(config['spawn_rate']),
        "--run-time", config['run_time'],
        "--headless",
        "--print-stats",
        "--html", f"locust-report-{config_name}.html",
        "--csv", f"locust-stats-{config_name}"
    ]
    
    try:
        result = subprocess.run(cmd, check=True)
        print(f"✅ Test completed successfully!")
        print(f"📈 Report saved as: locust-report-{config_name}.html")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Test failed with error: {e}")
        return False
    except FileNotFoundError:
        print("❌ Locust not found. Please install it with: pip install locust")
        return False


def main():
    parser = argparse.ArgumentParser(description="Run Locust load tests")
    parser.add_argument("scenario", help="Scenario to run", choices=[
        "main", "single", "realistic", "stress"
    ])
    parser.add_argument("--config", "-c", default="standard", 
                       help="Test configuration", choices=list(CONFIGS.keys()))
    parser.add_argument("--host", "-H", 
                       help="Target host (default: http://localhost:3000)")
    parser.add_argument("--ui", action="store_true",
                       help="Run with web UI (removes --headless)")
    
    args = parser.parse_args()
    
    # Map scenario names to files
    scenario_files = {
        "main": "locustfile.py",
        "single": "scenarios/single_query.py",
        "realistic": "scenarios/realistic_user.py",
        "stress": "scenarios/stress_test.py"
    }
    
    scenario_file = scenario_files[args.scenario]
    
    if args.ui:
        # Run with web UI
        cmd = [
            "locust",
            "-f", scenario_file,
            "--host", args.host or DEFAULT_HOST
        ]
        print(f"🌐 Starting Locust with web UI...")
        print(f"📱 Open http://localhost:8089 in your browser")
        subprocess.run(cmd)
    else:
        # Run headless
        run_locust_test(scenario_file, args.config, args.host)


if __name__ == "__main__":
    main() 
