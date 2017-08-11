class Speaker(object):

	def __init__(self):
		pass

	def say(self, what):
		print (what)

def ask(question, answers = []):
	noChoice = False
	if answers == -1:
		noChoice = True
	elif answers == 0:
		answers = ['y', 'n']
	possibleAnswers = ""
	if not noChoice:
		for answer in answers:
			possibleAnswers += answer + '/'
	value = -1
	error = True
	text = ("%s (%s)? " % (question, possibleAnswers[:-1])) if not noChoice else question
	while error:
		try:
			choice = input(text)
			if not noChoice:
				value = answers.index(choice)
			error = False
		except ValueError:
			value = -1
			print("Please select either of (%s)" % (possibleAnswers[:-1]))
	return value

def quote(text):
	return "'" + text + "'"
