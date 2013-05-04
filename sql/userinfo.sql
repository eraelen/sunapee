CREATE TABLE users (
uid integer primary key autoincrement,
username varchar(15) not null,
name varchar(30) not null,
password varchar(30) not null,
email varchar(30) not null,
location varchar(30),
website varchar(50),
profilepic varchar(500) not null,
profvis varchar(20),
background varchar(100)
);
insert into users values
(1,'tim','Tim Berners-Lee','mit',"aqua_manga@yahoo.com","Massachusetts","amazon.com","/images/users/defaultProfilePic.jpg","Public",null);
insert into users values
(2,'hazel','Hazel Rozetta','lezah',"ysasaki@smith.edu","United States","petco.com", "/images/users/defaultProfilePic.jpg","Public",null);
insert into users values
(3,'caleb','Caleb Marks','belac',"ysasaki2014@gmail.com","Asia","ebay.com","/images/users/defaultProfilePic.jpg","Public","");
insert into users values
(4,'cheerfuldonkey','Eeyore','eeyore',"mynameiseeyore@hundredacrewood.com","Hundred Acre Wood",null,"/images/users/eeyore_profilepic.jpg","Public",null);
insert into users values
(5,'thepooh','Winnie','winnie',"mynameiswinnie@hundredacrewood.com","Hundred Acre Wood", null,"/images/users/pooh_profilepic.jpg","Public",null);


CREATE TABLE isfollowings (
username varchar(15) not null,
fusername varchar(15) not null,
primary key (username, fusername),
foreign key (username, fusername) references userinfo(username, username)
);
insert into isfollowings values 
('tim','tim');
insert into isfollowings values 
('caleb','caleb');
insert into isfollowings values 
('hazel','hazel');
insert into isfollowings values 
('cheerfuldonkey','cheerfuldonkey');
insert into isfollowings values 
('thepooh','thepooh');

insert into isfollowings values 
('tim','caleb');
insert into isfollowings values 
('caleb','tim');
insert into isfollowings values 
('hazel','tim');
insert into isfollowings values 
('hazel','caleb');
insert into isfollowings values 
('caleb','hazel');


CREATE TABLE tweets (
tweetid integer primary key autoincrement,
username varchar(15) not null,
name varchar(30) not null,
date datetime not null,
msg varchar(140) not null,
reply integer,
retweet integer,
convo integer,
foreign key (username, name) references users(username, name)
);
insert into tweets values
(0,'tim',"Tim Berners-Lee", "2013-01-01 10:00:00","I'm in #Ford !",null,null,0);
insert into tweets values
(1,"hazel",'Hazel Rozetta', "2013-01-01 11:00:00", "@tim Good for you! Let's meet in CC tmr for web programming. @caleb", 0, null,0);


CREATE TABLE hashtags (
tweetid integer primary key not null,
hashtag varchar(40) not null,
foreign key (tweetid) references users(tweetid)
);

CREATE TABLE mentions (
tweetid integer not null,
atusername varchar(15) not null,
primary key (tweetid, atusername),
foreign key (tweetid) references tweets(tweetid),
foreign key (atusername) references users(username)

);
CREATE TABLE verifyUsers (
uid integer primary key autoincrement,
username varchar(15) not null,
name varchar(30) not null,
password varchar(30) not null,
email varchar(30) not null,
location varchar(30),
website varchar(50),
randVarCode varchar(15)
);




insert into hashtags values
(0,"#Ford");

insert into mentions values
(1,"@tim");
insert into mentions values
(1,"@caleb");
