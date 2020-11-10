#!/usr/bin/env python

from subprocess import check_output
import mysql.connector as mysql
import bcrypt

db = mysql.connect(
	host = "wewatch-db.f57rsdsadio.us-east-1.rds.amazonaws.com",
	user = "admin",
	password = "12341234",
	database = "main"
)

cursor = db.cursor()

def call(command):
	cursor.execute(command)
	v = []
	for x in cursor:
		v.append(x)
	ret = "\n".join([" ".join(  [str(x) for x in y]  ) for y in v ]   )
	return ret

def insert(videos):
	for v in videos:
		call("insert into videos (path) values (\"%s\")" % v);
	db.commit()

def getClientVideos(client):
	videos = [str(x) for x in check_output("./get-client-videos.sh %s" % client,shell=True).decode('utf-8').strip().split('\n')]
	return videos

def getUserID(email):
	try:
		id = call("SELECT id FROM users WHERE email='%s';" % email).strip();
		return id
	except Exception as e:
		return ''

def grantUserClients(username,clients):
	if not type(clients) == list:
		clients = [clients]
	for client in clients:
		userID = getUserID(username)
		compStr="INSERT INTO user_videos (user_id,video_id) SELECT '"
		compStr += userID
		compStr += "', id FROM videos WHERE path LIKE '" + client + "%'"
		call(compStr)
	db.commit()

def grantUserVideo(email,video):
	userID = getUserID(email)
	compStr="INSERT INTO user_videos (user_id,video_id) SELECT '%s', id FROM videos WHERE path = '%s'" % (userID,video)
	call(compStr)
	db.commit()

def grantUserVideos(email,videos):
	for vid in videos:
		grantUserVideo(email,vid)

def addUser(email,password):
	pwhash = bcrypt.hashpw(password.encode('utf-8'),bcrypt.gensalt()).decode('utf-8')
	call("INSERT INTO users (email, password_hash) VALUES ('%s','%s')" % (email,pwhash))
	db.commit()

def addVideo(video):
	call("INSERT INTO videos (path) VALUES ('%s')" % (video));
	db.commit()

def addVideos(videos):
	for video in videos:
		addVideo(video)









