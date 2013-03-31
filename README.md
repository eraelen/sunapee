# CMPSCI 326 Web Programming: Project 2
# Team Sunapee

We had a misconception about what this project was asking for but we tried to modify what we have so the site will show majority of the framework and some of the functionalities that we outlined in Project1.

Most of the exported functions in our /routes files will be greatly modified. We spoke to Tim about our misunderstanding about where functions/operations should go and we will be working on it.

Some additional notes:
* Navigation Bar : 
  We did not have enough time to finalize the compose new tweet and implement private messaging for this project. At the moment, they are inactive. The compose new tweet functionality is working through the User Home page. The tools icon should also contain a dropdown menu for edit settings, edit profile but clicking on it now simply directs the user to the Edit Settings page with a link to Edit Profile page.
* Tweet Functionality:
  We do not have the reply, delete and retweet functionalities setup yet.
* Overall Functionality:
  The functionality in the pages at the moment are not completely working or functional. Some issues are:
  * clicking on @username will make the server unintentionally think that username is signed it even if he is not
  * replying on a tweet via detailed tweet page will only edit the last tweet posted
  * searching is only through hashtags and does not take into account users and help topics
  * cookies are only implemented in home and not site-wide
  
For testing what is already functional:
* You may use login username: {tim, hazel, caleb}, password: {mit, lezah, belac}
* In registering for a new user, please use a valid and active email. The system does send email!