import random
import time

PLAYERS = ["Kristoffer", "Matias", "Johannes"] #, "Miriam", "Mikkel", "Emil", "Oivind", "Ask"
MAX_ROUNDS = 10
SWAP_THRESHOLDNUMBER = 4
SWAP_FUZZINESS = 0.0 #Simulates human error. 0.1 = 10% chance of making a mistake.

class Player(object):

	pid = 0
	name = ""
	score = 5
	heldCard = None
	wins = 0
	losses = 0

	TXT_WANT_TO_SWAP = "Jeg vil gjerne bytte med deg."
	TXT_ACCEPT_SWAP = "Jada, her er kortet mitt."
	TXT_KNOCK = " banker tre ganger på bordet. <BANK, BANK, BANK>"
	TXT_PASSES = " sier 'Jeg står.'"
	TXT_NO_WAY_FOOL = " and thinks ''Aldri i livet, %s har jo narren!''"

	def __init__(self, name, pid):
		self.name = name
		self.pid = pid

	def setHeldCard(self, card, silent = False):
		self.heldCard = card
		#if not silent: print ("INFO: " + self.name + " now has: " + self.heldCard.name)

	def drawFromDeck(self, deck):
		self.discard(deck)
		self.setHeldCard(deck.draw())

	def discard(self, deck):
		if not (self.heldCard == None):
			deck.discard(self.heldCard)
		self.heldCard = None
	
	def requestSwap(self, toPlayer):
		print (self.sayTo(toPlayer, 0) + quote(self.TXT_WANT_TO_SWAP))

	def answerSwap(self, fromPlayer):
		val = self.heldCard.value
		if not (val > 16):
			print (self.sayTo(fromPlayer, 1) + quote(self.TXT_ACCEPT_SWAP))
		else:
			reply = Card.statements[val] if val < 21 else Card.statements[val].upper() 
			print (self.sayTo(fromPlayer, 1) + quote(reply))
		return val

	def swapWithPlayer(self, fromPlayer):
		print ("INFO: %s swaps cards with %s." % (self.name, fromPlayer.name))
		card = self.heldCard
		self.setHeldCard(fromPlayer.heldCard)
		fromPlayer.setHeldCard(card)

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
		verb = ("added" if value > 0 else "subtracted")
		prepos = ("to" if value > 0 else "from")
		print ("%s %s %d %s score." % (self.name, verb, abs(value), prepos))

	def sayTo(self, toPlayer, typ):
		verb = ' asks ' if typ == 0 else ' answers '
		return self.name + verb + toPlayer.name + ": "

	def sayPass(self):
		return self.name + self.TXT_PASSES

	def sayNoFool(self, player):
		return self.TXT_NO_WAY_FOOL % (player.name)

	def knockOnTable(self):
		print (self.name + self.TXT_KNOCK)
		return True

	def testForSwap(self, toPlayer = None):
		value = self.heldCard.value
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

class Card(object):
	
	types = {
		'Gjøken': 21,
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
		21: 'Stå for gjøk!',
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
	discardPile = []

	def __init__(self):
		for key, val in Card.types.items():
			card = Card(key, val)
			self.cards.append(card)
			self.cards.append(card)
		self.printCards()
		self.shuffleDeck()

	def shuffleDeck(self):
		print ("*** INFO: The deck is shuffled.")
		random.shuffle(self.cards)

	def draw(self):
		card = None
		if self.isDeckEmpty():
			self.useDiscardPile()
		return self.cards.pop()

	def useDiscardPile(self):
		print ("**** INFO: The discard deck is used.")
		self.cards = self.discardPile
		self.shuffleDeck()
		self.discardPile = []

	def isDeckEmpty(self):
		return len(self.cards) == 0

	def discard(self, card):
		self.discardPile.append(card)
		print ("A %s card was discarded." % (card.name))

	def testLengthSum(self):
		if (len(self.cards) + len(self.discardPile) == 42):
			print ("All good, sum of piles piles is 42.")
		else:
			print ("Warning! Sum of piles is not 42.")
			self.printCards()
			self.printCards(True)

	def printCards(self, discarded = False):
		cardsLine = "Discarded: " if discarded else "Cards: "
		cardList = self.discardPile if discarded else self.cards
		for card in cardList:
			cardsLine += card.name + ", "
		cardsLine = cardsLine[:-2]
		print (cardsLine)

class Human(Player):

	human = True

	def __init__(self, name, pid):
		Player.__init__(self, name, pid)

	def knockOnTable(self):
		result = self.inputYesNo("Knock on the table")
		if (result):
			print (self.name + self.TXT_KNOCK)
		return result

	def drawFromDeck(self, deck):
		super(Human, self).drawFromDeck(deck)
		self.printGotCard()

	def requestSwap(self, toPlayer):
		result = self.inputYesNo("Do you want to swap cards with %s" % (toPlayer.name))
		if (result):
			print (self.sayTo(toPlayer, 0) + quote(self.TXT_WANT_TO_SWAP))
		return result

	def swapWithPlayer(self, fromPlayer):
		super(Human, self).swapWithPlayer(fromPlayer)
		self.printGotCard()

	def printGotCard(self):
		print ("Player %s, you got the card %s." % (self.name, self.heldCard.name))

	def inputYesNo(self, question):
		choice = input("%s (y/n)? " % (question))
		return choice.upper() == 'Y'

	def testForSwap(self, toPlayer):
		text = "Do you want to "
		if (toPlayer == "deck"):
			text += "draw from the deck"
		else:
			text += "swap cards with %s" % (toPlayer.name)
		result = self.inputYesNo(text)

# ------------- End of classes ---------------		

def playGame():
	players = []

	humanName = enterHumanPlayer()
	human = Human(humanName, len(PLAYERS) + 1)

	for index, name in enumerate(PLAYERS):
		players.append(Player(name, index))

	players.append(human)
	random.shuffle(players)
	deck = Deck()
	round = 1

	while not round > MAX_ROUNDS:
		print ("Round: %d ===> Card pile length: %d -----------------------" % (round, len(deck.cards)))

		#Draw cards for each player
		for player in players:
			player.drawFromDeck(deck)
			if player.heldCard.value == 4: #If player receives Narren
				if player.knockOnTable():
					player.addToScore(1)

		#Play round
		for nbr, player in enumerate(players, 0):
			wantsToSwap = False
			sayPass = player.sayPass()
			if not nbr == len(players) - 1:
				if players[nbr + 1].heldCard.value == 4: #If the other player has Narren...
					if not player.testForSwap(): #Do small chance check if player has forgotten someone knocked 3 times.
						sayPass += player.sayNoFool(players[nbr + 1])
					else:
						wantsToSwap = True
				else:
					if player.testForSwap(): #Only ask to swap if card is 4 or less.
						wantsToSwap = True

				if wantsToSwap:
					if not (askPlayers(nbr, player, players, deck)): #Check if Staa for gjok! is called.
						break
				else:
					print (sayPass)
			else:
				if player.testForSwap("deck"): #Only swap if card is 4 or less.
					print (player.name + " draws from the deck.")
					player.drawFromDeck(deck) #Draw from deck if noone else to swap with.
				else:
					print (sayPass)

		print ("End of round " + str(round) + " ======================================")
		#End of round

		#Calculate scores and stats
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

		#All players toss their cards in the discard pile
		for player in players:
			player.discard(deck)

		deck.testLengthSum()

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
		print ("")
		time.sleep(0.5) #Pause 1/2 second

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
			player.swapWithPlayer(players[nbr + nextAdd])
			hasSwapped = True
		if not hasSwapped: #If player still hasn't swapped after being last in round
			print (player.name + " draws from the deck.")
			player.drawFromDeck(deck)

	return True

def enterHumanPlayer():
	print ("<<< Welcome to Gnav The Card Game >>>")
	return input("Please enter your name: ")

def quote(text):
	return "'" + text + "'"

playGame()