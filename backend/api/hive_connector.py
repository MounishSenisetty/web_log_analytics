from pyhive import hive
import pandas as pd

class HiveConnector:
    def __init__(self, host='hive-server', port=10000, database='default'):
        """
        Initialize connection to Hive
        """
        self.host = host
        self.port = port
        self.database = database
        
    def get_connection(self):
        """
        Create a connection to Hive
        """
        return hive.Connection(
            host=self.host,
            port=self.port,
            database=self.database,
            username='root'  # No authentication in dev environment
        )
    
    def execute_query(self, query):
        """
        Execute a query and return results as a list of dictionaries
        """
        conn = self.get_connection()
        cursor = conn.cursor()
        cursor.execute(query)
        
        # Get column names
        if cursor.description:
            columns = [desc[0] for desc in cursor.description]
            
            # Fetch all results
            results = cursor.fetchall()
            
            # Convert to list of dictionaries
            data = []
            for row in results:
                data.append(dict(zip(columns, row)))
                
            cursor.close()
            conn.close()
            
            return data
        else:
            cursor.close()
            conn.close()
            return []
