import random

class Player(object):

	name = ""
	score = 5
	heldCard = None

	def __init__(self, name):
		self.name = name

	def setHeldCard(self, card, silent = False):
		self.heldCard = card
		if not silent: print (self.name + " now has: " + self.heldCard.name)
	
	def requestSwap(self, toPlayer):
		print (self.sayTo(toPlayer, 0) + quote("Jeg vil gjerne bytte med deg."))

	def answerSwap(self, fromPlayer):
		val = fromPlayer.heldCard.value
		if not val > 16:
			print (self.sayTo(fromPlayer, 1) + quote("Jada, her er kortet mitt."))
		else:
			print (self.sayTo(fromPlayer, 1) + quote(Card.statements[val]))

	def draw(self):
		pass

	def addToScore(self, value):
		self.score += value
		print (self.name + " added " + str(value) + " to score.")

	def sayTo(self, toPlayer, typ):
		verb = ' asks ' if typ == 0 else ' answers '
		return self.name + verb + toPlayer.name + ": "


class Card(object):
	
	types = {
		'Gjoken': 21,
		'Dragonen': 20,
		'Hesten': 19,
		'Huset': 18,
		'Katten': 17,
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
		'Pottem': 3,
		'Uglen': 2,
		'0': 1
	}

	statements = {
		21: 'Staa for gjok!',
		20: 'Hogg av!',
		19: 'Hest forbi!',
		18: 'Hus forbi!',
		17: 'Kiss!'
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
	players.append(Player("Kristoffer"))
	players.append(Player("Matias"))
	players.append(Player("Johannes"))
	players.append(Player("Miriam"))
	players.append(Player("Mikkel"))

	deck = Deck()
	round = 1

	while not round > 5:
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
					player.requestSwap(players[nbr+1])
				else:
					print (player.name + " says 'Pass' and thinks ''Aldri i livet, " + players[nbr+1].name + " har jo narren!''")
				players[nbr+1].answerSwap(player)
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

def quote(text):
	return "'" + text + "'"

playGame()