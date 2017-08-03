import random

PLAYERS = ["Kristoffer", "Matias", "Johannes", "Miriam"] #, "Mikkel", "Emil", "Oivind", "Ask"
MAX_ROUNDS = 500
SWAP_THRESHOLDNUMBER = 4
SWAP_FUZZINESS = 0.0 #Simulates human error. 0.1 = 10% chance of making a mistake.

class Player(object):

	pid = 0
	name = ""
	score = 5
	heldCard = None
	wins = 0
	losses = 0

	def __init__(self, name, pid):
		self.name = name
		self.pid = pid

	def setHeldCard(self, card, silent = False):
		self.heldCard = card
		if not silent: print ("INFO: " + self.name + " now has: " + self.heldCard.name)
	
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
		return self.name + " says 'Jeg staar.'"

class Card(object):
	
	types = {
		'Gjoeken': 21,
		'Dragonen': 20,
		'Katten': 19,
		'Hesten': 18,
		'Huset': 17,
		'(12)': 16,
		'(11)': 15,
		'(10)': 14,
		'(9)': 13,
		'(8)': 12,
		'(7)': 11,
		'(6)': 10,
		'(5)': 9,
		'(4)': 8,
		'(3)': 7,
		'(2)': 6,
		'(1)': 5,
		'Narren': 4,
		'Potten': 3,
		'Uglen': 2,
		'(0)': 1
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
		print ("******INFO: The deck is shuffled.")
		cards = []
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

# ------------- End of classes ---------------		

def playGame():
	players = []
	allPlayers = PLAYERS
	random.shuffle(allPlayers)
	for index, name in enumerate(allPlayers):
		players.append(Player(name, index))

	deck = Deck()
	round = 1

	while not round > MAX_ROUNDS:
		print ("Round: " + str(round) + " ======================================")

		#Draw cards for each player
		for player in players:
			card = deck.draw()
			player.setHeldCard(card, True)
			if card.value == 4: #If player receives Narren
				print (player.name + " knocks three times on the table. <BANK, BANK, BANK>")
				player.addToScore(1)

		#Play round
		for nbr, player in enumerate(players, 0):
			#print (player.name + "'s card: " + str(player.heldCard.name))
			wantsToSwap = False
			sayPass = player.sayPass()
			if not nbr == len(players) - 1:
				if players[nbr + 1].heldCard.value == 4: #If the other player has Narren...
					if not testForSwap(player.heldCard.value): #Do small chance check if player has forgotten someone knocked 3 times.
						sayPass += " and thinks ''Aldri i livet, " + players[nbr + 1].name + " har jo narren!''"
					else:
						wantsToSwap = True
				else:
					if testForSwap(player.heldCard.value): #Only ask to swap if card is 4 or less.
						wantsToSwap = True

				if wantsToSwap:
					if not (askPlayers(nbr, player, players, deck)): #Check if Staa for gjok! is called.
						break
				else:
					print (sayPass)
			else:
				if testForSwap(player.heldCard.value): #Only swap if card is 4 or less.
					print (player.name + " draws from the deck.")
					player.setHeldCard(deck.draw()) #Draw from deck if noone else to swap with.
				else:
					print (sayPass)

		#End of round

		print ("End of round " + str(round) + " ======================================")
		sortedPlayers = sorted(players, key=lambda p: p.heldCard.value, reverse=True)
		winner = sortedPlayers[0]
		winner.wins += 1
		loser = sortedPlayers[len(sortedPlayers)-1]
		loser.losses += 1
		print ("Winner of this round is " + winner.name + " with the card " + winner.heldCard.name)
		winner.addToScore(1)
		print ("Loser of this round is " + loser.name + " with the card " + loser.heldCard.name)
		loser.addToScore(-1)
		#Search for Narren among players
		for player in players:
			if (player.heldCard.value == 4):
				print ("Unfortunately, " + player.name + "'s card at end of round is Narren.")
				player.addToScore(-1)

		mostWins = sorted(players, key=lambda p: p.wins, reverse=True)
		mostLosses = sorted(players, key=lambda p: p.losses, reverse=True)
		highestScore = sorted(players, key=lambda p: p.score, reverse=True)

		scoreLine = "--> Score: "

		for player in players:
			thisPly = player.name
			if (player.pid == highestScore[0].pid):
				thisPly = "**" + thisPly.upper() + "**"
			scoreLine += thisPly + ": " + str(player.score) + ", "
		print (scoreLine[:-2])
		print ("STATS: Most wins -> " + mostWins[0].name + ": " + str(mostWins[0].wins) + ", most losses -> " + mostLosses[0].name + ": " + str(mostLosses[0].losses))

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
		return False #Player doesn't want to swap and will say pass.
	else:
		return True #Player wants to swap.

def askPlayers(nbr, player, players, deck):
	nextAdd = 1
	hasSwapped = False
	while not hasSwapped and (nbr + nextAdd) < len(players):
		player.requestSwap(players[nbr + nextAdd])
		returnedCardValue = players[nbr + nextAdd].answerSwap(player)
		if returnedCardValue == 4:
			print (":-) Everybody starts laughing and says 'Men " + players[nbr + nextAdd].name + " har jo narren!'")
		result = player.processAnswer(returnedCardValue)
		if (result == 1):
			player.addToScore(-1)
			nextAdd += 1
		elif (result == 2):
			for ply in players:
				if not (ply.pid == players[nbr + nextAdd].pid):
					ply.addToScore(-1) #All other players loses 1 score.
			return False
		else: #The two players Swap cards
			card = player.heldCard
			player.setHeldCard(players[nbr + nextAdd].heldCard)
			players[nbr + nextAdd].setHeldCard(card)
			hasSwapped = True
		if not hasSwapped: #If player stilled hasn't swapped after being last in round
			#print ("stilled hasn't swapped........")
			print (player.name + " draws from the deck.")
			player.setHeldCard(deck.draw())

	return True

def quote(text):
	return "'" + text + "'"

playGame()