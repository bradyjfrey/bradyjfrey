<?php 
$name= $_POST['name']; 
$email= $_POST['email']; 
$address=  $_POST['address']; 
$city=  $_POST['city']; 
$state=  $_POST['state']; 
$zip=  $_POST['zip']; 
$dayphone=  $_POST['dayphone']; 
$evephone=  $_POST['evephone']; 
$group=  $_POST['group']; 
$where=  $_POST['where'];
$headers=  "From: $email";

$body = " 
Name: $name 
Email: $email 
Address: $address
City: $city
State: $state
Zip: $zip
Day Phone: $dayphone
Evening Phone: $evephone

How many are in your group? $group
When are you visiting the Napa Valley? $where


"; 

mail("brady@dotfive.com,tb@napavalleydrifters.com","NVD Booking Request: $name",$body,$headers); 
header("Location:http://www.napavalleydrifters.com/01thankyou.html"); 
?> 
