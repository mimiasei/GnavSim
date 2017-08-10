

def ask(question, answers = []):
	if not answers:
		answers = ['y', 'n']
	possibleAnswers = ""
	for answer in answers:
		possibleAnswers += answer + '/'
	value = -1
	error = True
	while error:
		try:
			choice = input("%s (%s)? " % (question, possibleAnswers[:-1]))
			value = answers.index(choice)
			error = False
		except ValueError:
			value = -1
			print("Please select either of (%s)" % (possibleAnswers[:-1]))
	return value

def quote(text):
	return "'" + text + "'"