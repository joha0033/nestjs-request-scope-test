#!/usr/bin/env python3
"""
Test report generator for testing the Locust parser
Creates sample HTML reports with realistic data
"""

import json
import os
from datetime import datetime

def generate_sample_html_report(scenario_name="test", config_name="standard"):
    """Generate a sample HTML report for testing"""
    
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Locust Test Report</title>
    <style>
        .statistics {{ width: 100%; border-collapse: collapse; }}
        .statistics th, .statistics td {{ border: 1px solid #ddd; padding: 8px; text-align: left; }}
        .statistics th {{ background-color: #f2f2f2; }}
    </style>
</head>
<body>
    <h1>Locust Test Report</h1>
    <h2>Test Configuration</h2>
    <ul>
        <li>Scenario: {scenario_name}</li>
        <li>Total users: 50</li>
        <li>Test duration: 2m</li>
        <li>Total requests: 12,453</li>
        <li>Failure rate: 0.02%</li>
        <li>Average response time: 45.2ms</li>
        <li>Requests per second: 103.77</li>
        <li>95th percentile: 89.5ms</li>
        <li>99th percentile: 156.8ms</li>
    </ul>
    
    <h2>Request Statistics</h2>
    <table class="statistics">
        <thead>
            <tr>
                <th>Type</th>
                <th># Requests</th>
                <th># Failures</th>
                <th>Median</th>
                <th>Average</th>
                <th>Min</th>
                <th>Max</th>
                <th>Average size</th>
                <th>Current RPS</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>getUser</td>
                <td>3,245</td>
                <td>1</td>
                <td>42</td>
                <td>41.2</td>
                <td>15</td>
                <td>245</td>
                <td>156</td>
                <td>27.08</td>
            </tr>
            <tr>
                <td>getProduct</td>
                <td>2,876</td>
                <td>0</td>
                <td>38</td>
                <td>39.8</td>
                <td>12</td>
                <td>198</td>
                <td>234</td>
                <td>23.97</td>
            </tr>
            <tr>
                <td>getPayment</td>
                <td>2,654</td>
                <td>1</td>
                <td>46</td>
                <td>47.3</td>
                <td>18</td>
                <td>289</td>
                <td>187</td>
                <td>22.12</td>
            </tr>
            <tr>
                <td>getUserPayment</td>
                <td>2,189</td>
                <td>0</td>
                <td>52</td>
                <td>53.7</td>
                <td>21</td>
                <td>312</td>
                <td>203</td>
                <td>18.24</td>
            </tr>
            <tr>
                <td>Browse: getUser</td>
                <td>1,489</td>
                <td>0</td>
                <td>44</td>
                <td>45.1</td>
                <td>19</td>
                <td>267</td>
                <td>156</td>
                <td>12.41</td>
            </tr>
            <tr>
                <td><strong>Total</strong></td>
                <td><strong>12,453</strong></td>
                <td><strong>2</strong></td>
                <td><strong>44</strong></td>
                <td><strong>45.2</strong></td>
                <td><strong>12</strong></td>
                <td><strong>312</strong></td>
                <td><strong>187</strong></td>
                <td><strong>103.77</strong></td>
            </tr>
        </tbody>
    </table>
    
    <h2>Response Time Distribution</h2>
    <ul>
        <li>50th percentile: 44ms</li>
        <li>66th percentile: 58ms</li>
        <li>75th percentile: 67ms</li>
        <li>80th percentile: 73ms</li>
        <li>90th percentile: 85ms</li>
        <li>95th percentile: 89.5ms</li>
        <li>98th percentile: 134ms</li>
        <li>99th percentile: 156.8ms</li>
        <li>99.9th percentile: 245ms</li>
        <li>99.99th percentile: 312ms</li>
        <li>100th percentile: 312ms</li>
    </ul>
    
    <h2>Charts</h2>
    <div id="charts">
        <p>Response time charts would be here...</p>
    </div>
</body>
</html>"""

    # Write to file
    filename = f"locust-report-{config_name}.html"
    with open(filename, 'w') as f:
        f.write(html_content)
    
    print(f"✅ Generated sample report: {filename}")
    return filename

def generate_sample_csv_stats(config_name="standard"):
    """Generate sample CSV stats files"""
    
    # Stats CSV
    stats_csv = f"""Type,Name,Request Count,Failure Count,Median Response Time,Average Response Time,Min Response Time,Max Response Time,Average Content Size,Requests/s,Failures/s,50%,66%,75%,80%,90%,95%,98%,99%,99.9%,99.99%,100%
POST,getUser,3245,1,42,41.2,15,245,156,27.08,0.0083,42,54,61,65,78,89,121,156,234,245,245
POST,getProduct,2876,0,38,39.8,12,198,234,23.97,0.0,38,49,55,59,71,82,109,134,187,198,198
POST,getPayment,2654,1,46,47.3,18,289,187,22.12,0.0083,46,58,66,70,83,94,127,165,256,289,289
POST,getUserPayment,2189,0,52,53.7,21,312,203,18.24,0.0,52,65,72,77,89,101,138,178,267,312,312
POST,Browse: getUser,1489,0,44,45.1,19,267,156,12.41,0.0,44,56,63,67,79,91,123,159,234,267,267
None,Total,12453,2,44,45.2,12,312,187,103.77,0.0166,44,56,63,67,79,91,123,159,234,312,312
"""
    
    # Failures CSV
    failures_csv = f"""Method,Name,Error,Occurrences
POST,getUser,ConnectionError,1
POST,getPayment,TimeoutError,1
"""
    
    # Write CSV files
    stats_filename = f"locust-stats-{config_name}_stats.csv"
    failures_filename = f"locust-stats-{config_name}_failures.csv"
    
    with open(stats_filename, 'w') as f:
        f.write(stats_csv)
    
    with open(failures_filename, 'w') as f:
        f.write(failures_csv)
    
    print(f"✅ Generated sample CSV files: {stats_filename}, {failures_filename}")
    return stats_filename, failures_filename

def main():
    """Generate sample test reports"""
    print("🧪 Generating sample Locust reports for testing...")
    
    # Generate different scenario reports
    scenarios = [
        ("quick", "Quick test scenario"),
        ("standard", "Standard test scenario"),
        ("stress", "Stress test scenario")
    ]
    
    for config_name, description in scenarios:
        print(f"\n📊 Generating {description}...")
        generate_sample_html_report(config_name, config_name)
        generate_sample_csv_stats(config_name)
    
    print("\n🎉 Sample reports generated successfully!")
    print("💡 You can now test the Locust summary commands:")
    print("   npm run locust:summary")
    print("   npm run locust:summary:all")
    print("   npm run locust:summary:rank")

if __name__ == "__main__":
    main() 
