import sys
from sys import stdin, exit
from time import sleep, localtime
from PodSixNet.Channel import Channel
from PodSixNet.Connection import ConnectionListener, connection
import _thread
from gnavtools import ask
from gnavtools import Speaker

# Multiplayer stuff -----------------
# HOST = "localhost"
# PORT = 112

# Client ------------------------------------------

# This example uses Python threads to manage async input from sys.stdin.
# This is so that I can receive input from the console whilst running the server.
# Don't ever do this - it's slow and ugly. (I'm doing it for simplicity's sake)
from _thread import *

class Client(ConnectionListener):
	def __init__(self, host, port):
		self.Connect((host, port))
		print("Chat client started")
		print("Ctrl-C to exit")
		# get a nickname from the user before starting
		print("Enter your nickname: ")
		connection.Send({"action": "nickname", "nickname": stdin.readline().rstrip("\n")})
		# launch our threaded input loop
		#t = _thread.start_new_thread(self.InputLoop, ())
	
	def Loop(self):
		connection.Pump()
		self.Pump()
	
	#def InputLoop(self):
		# horrid threaded input loop
		# continually reads from stdin and sends whatever is typed to the server
		#while 1:
		#	connection.Send({"action": "message", "message": stdin.readline().rstrip("\n")})

	def Send(self, message):
		connection.Send({"action": "message", "message": message.rstrip("\n")})
	
	#######################################
	### Network event/message callbacks ###
	#######################################
	
	def Network_players(self, data):
		print("*** players: " + ", ".join([p for p in data['players']]))
	
	def Network_message(self, data):
		print(data['who'] + ": " + data['message'])
	
	# built in stuff

	def Network_connected(self, data):
		print("You are now connected to the server")
	
	def Network_error(self, data):
		print('error:', data['error'][1])
		connection.Close()
	
	def Network_disconnected(self, data):
		print('Server disconnected')
		exit()

class NetworkClient(object):

	speaker = None
	client = None

	def __init__(self, speaker, host, port):
		print ("Starting client listening on %s and port %d..." % (host, port))
		self.client = Client(host, port)
		speaker.setClient(self.client)
		self.speaker = speaker

	def loop(self):
		while True:
			self.client.Loop()
			sleep(0.001)

class ChatSpeaker(Speaker):

	client = None

	def setClient(self, client):
		self.client = client

	def say(self, what):
		if not (client == None):
			self.client.Send({ "action": "message", "message": what })
			print ("Message: %s sent to server %s:%d." % (what, self.client.host, self.client.port))
		else:
			print ("Error: Client not set, unable to say message over network.")
