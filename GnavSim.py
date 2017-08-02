import random

PLAYERS = ["Kristoffer", "Matias", "Johannes", "Miriam", "Mikkel"]
MAX_ROUNDS = 10
SWAP_THRESHOLDNUMBER = 4
SWAP_FUZZINESS = 0.0

class Player(object):

	pid = 0
	name = ""
	score = 5
	heldCard = None

	def __init__(self, name, pid):
		self.name = name
		self.pid = pid

	def setHeldCard(self, card, silent = False):
		self.heldCard = card
		if not silent: print (self.name + " now has: " + self.heldCard.name)
	
	def requestSwap(self, toPlayer):
		print (self.sayTo(toPlayer, 0) + quote("Jeg vil gjerne bytte med deg."))

	def answerSwap(self, fromPlayer):
		val = self.heldCard.value
		if not (val > 16):
			print (self.sayTo(fromPlayer, 1) + quote("Jada, her er kortet mitt."))
		else:
			reply = Card.statements[val] if val < 21 else Card.statements[val].upper() 
			print (self.sayTo(fromPlayer, 1) + quote(reply))
		return val

	def processAnswer(self, returnedCardValue):
		if (returnedCardValue > 16):
			if (returnedCardValue > 16 and returnedCardValue < 21): #huset, hesten, katten & dragonen
				return 1 #Loses 1 score and must ask next player.
			elif (returnedCardValue == 21): #gjoken
				return 2 #All other players than the one with Gjoken loses 1 score and turn is over.
		else:
			return 0 #Nothing happens.

	def addToScore(self, value):
		self.score += value
		print (self.name + " added " + str(value) + " to score.")

	def sayTo(self, toPlayer, typ):
		verb = ' asks ' if typ == 0 else ' answers '
		return self.name + verb + toPlayer.name + ": "

	def sayPass(self):
		return self.name + " says 'Jeg staar'"

class Card(object):
	
	types = {
		'Gjoken': 21,
		'Dragonen': 20,
		'Katten': 19,
		'Hesten': 18,
		'Huset': 17,
		'12': 16,
		'11': 15,
		'10': 14,
		'9': 13,
		'8': 12,
		'7': 11,
		'6': 10,
		'5': 9,
		'4': 8,
		'3': 7,
		'2': 6,
		'1': 5,
		'Narren': 4,
		'Potten': 3,
		'Uglen': 2,
		'0': 1
	}

	statements = {
		21: 'Staa for gjok!',
		20: 'Hogg av!',
		19: 'Kiss!',
		18: 'Hest forbi!',
		17: 'Hus forbi!'
	}

	name = ""
	value = 0

	def __init__(self, name, value):
		self.name = name
		self.value = value

	def __repr__(self):
		return '%s: %d' % (self.name, self.value)

class Deck(object):

	cards = []
	current = 0

	def __init__(self):
		self.shuffleDeck()

	def shuffleDeck(self):
		for key, val in Card.types.items():
			card = Card(key, val)
			self.cards.append(card)
			self.cards.append(card)
		random.shuffle(self.cards)
		self.current = 0

	def draw(self):
		card = self.cards[self.current]
		self.current += 1
		if (self.current == len(self.cards)):
			self.shuffleDeck()
		return card

def playGame():
	players = []
	for index, name in enumerate(PLAYERS):
		players.append(Player(name, index))

	deck = Deck()
	round = 1

	while not round > MAX_ROUNDS:
		print ("Round: " + str(round))

		#Draw cards for each player
		for player in players:
			card = deck.draw()
			player.setHeldCard(card, True)
			if card.value == 4:
				print (player.name + " knocks three times on the table.")

		#Play round
		for nbr, player in enumerate(players, 0):
			#print (player.name + "'s card: " + str(player.heldCard.name))

			if not nbr == len(players)-1:
				if not players[nbr+1].heldCard.value == 4:
					if not testForSwap(player.heldCard.value): #Only ask to swap if card is 4 or less.
						if not (askPlayers(nbr, player, players)):
							break
					else:
						print (player.sayPass())
				else:
					print (player.sayPass() + " and thinks ''Aldri i livet, " + players[nbr+1].name + " har jo narren!''")		
			else:
				player.setHeldCard(deck.draw(), True)

		sortedPlayers = sorted(players, key=lambda p: p.heldCard.value, reverse=True)
		winner = sortedPlayers[0]
		loser = sortedPlayers[len(sortedPlayers)-1]
		winner.addToScore(1)
		loser.addToScore(-1)

		scoreLine = "--> Score: "
		for player in players:
			scoreLine += player.name + ": " + str(player.score) + ", "
		print (scoreLine[:-2])

		round += 1
		print

def testForSwap(value):
	swap = SWAP_THRESHOLDNUMBER + 4
	chance = random.uniform(0.0, 1.0)
	if (chance < SWAP_FUZZINESS):
		swap -= 1
	elif (chance > 1 - SWAP_FUZZINESS):
		swap += 1

	if (value > swap):
		return True
	else:
		return False

def askPlayers(nbr, player, players):
	nextAdd = 1
	hasSwapped = False
	while not hasSwapped and (nbr + nextAdd) < len(players):
		player.requestSwap(players[nbr + nextAdd])
		returnedCardValue = players[nbr + nextAdd].answerSwap(player)
		result = player.processAnswer(returnedCardValue)
		if (result == 1):
			player.addToScore(-1)
			nextAdd += 1
		elif (result == 2):
			for ply in players:
				if not (ply.pid == players[nbr + nextAdd].pid):
					ply.addToScore(-1) #All other players loses 1 score.
			return False
		else:
			hasSwapped = True
	return True

def quote(text):
	return "'" + text + "'"

playGame()