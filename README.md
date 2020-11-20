# Metrics plugin
 Metrics plugin provides a simple way to show a dashboard of KPI's. 

# How it works
On the control panel you can add metrics, which have two types (metric, parent).

Metric type has a value which can be added and updated.
Parent type has children which can be of either type and its value depends on its children's values.

Each metric of either type can have an action item which can be added by the admin.

# Different data depending on queryString (clientProfile) and data policy type (Public, Private).
Metrics plugin can take a query string (clientProfile), each clientProfile have its own data (history data) and can update based on user's tags.  

If the query string (clientProfile) is not provided we look at the data type:

  If the data policy type is **private**, the (history) data will be available for each user separately and can only be viewed or updated only by the user.  
  If the data policy type is **public**, all the (history) data will be available for all the users and can be updated based on user's tags.  
    
