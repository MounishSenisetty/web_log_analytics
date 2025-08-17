import findspark
findspark.init()

from pyspark.sql import SparkSession
from pyspark.sql import functions as F
from pyspark.sql.window import Window
from pyspark.ml.feature import VectorAssembler
from pyspark.ml.clustering import KMeans
import pandas as pd

class SparkConnector:
    def __init__(self, master='spark://spark-master:7077', app_name='LogAnalytics'):
        """
        Initialize connection to Spark
        """
        self.master = master
        self.app_name = app_name
        self.spark = self._create_spark_session()
        
    def _create_spark_session(self):
        """
        Create a Spark session
        """
        return SparkSession.builder \
            .appName(self.app_name) \
            .master(self.master) \
            .config("spark.jars.packages", "org.apache.spark:spark-sql-kafka-0-10_2.12:3.0.0") \
            .enableHiveSupport() \
            .getOrCreate()
    
    def get_user_sessions(self, session_timeout_minutes=30):
        """
        Group logs into user sessions
        """
        # Read web logs
        logs_df = self.spark.table("web_logs")
        
        # Define a window partitioned by IP and user agent, ordered by timestamp
        window_spec = Window.partitionBy("ip", "user_agent").orderBy("timestamp")
        
        # Calculate the time difference between consecutive requests
        logs_with_time_diff = logs_df.withColumn(
            "prev_timestamp", 
            F.lag("timestamp").over(window_spec)
        ).withColumn(
            "time_diff_minutes", 
            (F.unix_timestamp("timestamp") - F.unix_timestamp("prev_timestamp")) / 60
        )
        
        # Mark the start of a new session when time difference exceeds the timeout
        logs_with_session_marker = logs_with_time_diff.withColumn(
            "is_new_session", 
            F.when(
                (F.col("time_diff_minutes").isNull()) | 
                (F.col("time_diff_minutes") > session_timeout_minutes),
                1
            ).otherwise(0)
        )
        
        # Assign session IDs
        windowed = Window.partitionBy("ip", "user_agent").orderBy("timestamp")
        logs_with_session_id = logs_with_session_marker.withColumn(
            "session_id", 
            F.concat(
                F.col("ip"),
                F.lit("_"),
                F.col("user_agent"),
                F.lit("_"),
                F.sum("is_new_session").over(windowed)
            )
        )
        
        # Group by session ID and aggregate
        session_stats = logs_with_session_id.groupBy("session_id").agg(
            F.min("timestamp").alias("start_time"),
            F.max("timestamp").alias("end_time"),
            F.count("*").alias("page_views"),
            F.collect_list("url").alias("pages_visited")
        ).withColumn(
            "duration_minutes", 
            (F.unix_timestamp("end_time") - F.unix_timestamp("start_time")) / 60
        )
        
        # Convert to pandas for API return
        return session_stats.toPandas().to_dict(orient="records")
    
    def detect_anomalies(self):
        """
        Detect anomalies in traffic patterns using K-means clustering
        """
        # Read web logs
        logs_df = self.spark.table("web_logs")
        
        # Group by hour and count requests
        hourly_traffic = logs_df.withColumn(
            "hour", 
            F.date_format("timestamp", "yyyy-MM-dd HH:00:00")
        ).groupBy("hour").count().orderBy("hour")
        
        # Create feature vector
        assembler = VectorAssembler(inputCols=["count"], outputCol="features")
        traffic_features = assembler.transform(hourly_traffic)
        
        # Apply K-means clustering
        kmeans = KMeans(k=3, seed=1)  # Assuming 3 clusters: normal, high, low
        model = kmeans.fit(traffic_features)
        predictions = model.transform(traffic_features)
        
        # Find the cluster with the lowest count (potential anomalies)
        cluster_stats = predictions.groupBy("prediction").agg(
            F.avg("count").alias("avg_count")
        ).orderBy("avg_count")
        
        # Get the anomaly cluster
        anomaly_cluster = cluster_stats.first()["prediction"]
        
        # Filter for anomalies
        anomalies = predictions.filter(
            F.col("prediction") == anomaly_cluster
        ).select("hour", "count")
        
        # Convert to pandas for API return
        return anomalies.toPandas().to_dict(orient="records")
