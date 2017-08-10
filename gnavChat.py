import sys
from sys import stdin, exit
from time import sleep, localtime
from weakref import WeakKeyDictionary
from PodSixNet.Channel import Channel
from PodSixNet.Server import Server
from PodSixNet.Connection import ConnectionListener, connection
import gnavtools

# Multiplayer stuff -----------------
HOST = "localhost"
PORT = 111

# Server --------------------------------------
class ClientChannel(Channel):
	"""
	This is the server representation of a single connected client.
	"""
	def __init__(self, *args, **kwargs):
		self.nickname = "anonymous"
		Channel.__init__(self, *args, **kwargs)
	
	def Close(self):
		self._server.DelPlayer(self)
	
	##################################
	### Network specific callbacks ###
	##################################
	
	def Network_message(self, data):
		self._server.SendToAll({"action": "message", "message": data['message'], "who": self.nickname})
	
	def Network_nickname(self, data):
		self.nickname = data['nickname']
		self._server.SendPlayers()

class ChatServer(Server):
	channelClass = ClientChannel
	
	def __init__(self, *args, **kwargs):
		Server.__init__(self, *args, **kwargs)
		self.players = WeakKeyDictionary()
		print('Server launched')
	
	def Connected(self, channel, addr):
		self.AddPlayer(channel)
	
	def AddPlayer(self, player):
		print("New Player" + str(player.addr))
		self.players[player] = True
		self.SendPlayers()
		print("players", [p for p in self.players])
	
	def DelPlayer(self, player):
		print("Deleting Player" + str(player.addr))
		del self.players[player]
		self.SendPlayers()
	
	def SendPlayers(self):
		self.SendToAll({"action": "players", "players": [p.nickname for p in self.players]})
	
	def SendToAll(self, data):
		[p.Send(data) for p in self.players]
	
	def Launch(self):
		while True:
			self.Pump()
			sleep(0.0001)

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
		t = start_new_thread(self.InputLoop, ())
	
	def Loop(self):
		connection.Pump()
		self.Pump()
	
	def InputLoop(self):
		# horrid threaded input loop
		# continually reads from stdin and sends whatever is typed to the server
		while 1:
			connection.Send({"action": "message", "message": stdin.readline().rstrip("\n")})

	def send(self, message):
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

#Starts multiplayer networking
def StartOrMPGame():
	if len(sys.argv) != 2:
		host = HOST
		port = PORT
	else:
		host, port = sys.argv[1].split(":")
		port = int(port)

	choice = ask("Select Server, Client or Not multiplayer", ['s', 'c', 'n'])
	if choice == 0:
		print ("Starting server on %s and port %d..." % (host, port))
		server = ChatServer(localaddr=(host, port))
		server.Launch()
	elif choice == 1:
		print ("Starting client listening on %s and port %d..." % (host, port))
		client = Client(host, port)
		while True:
			client.Loop()
			sleep(0.001)
	else:
		pass

class ChatSpeaker(gnavtools.Speaker):

	host = ""
	port = 0
	client = None

	def initChat(client, host = Host, port = PORT):
		self.host = host
		self.port = port
		self.client = client

	def say(self, what):
		self.client.send({"action": "message", "message": what.rstrip("\n")})
		print ("Message: %s sent to server %s:%d." % (what, self.host, self.port))