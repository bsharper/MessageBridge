

import json, sys
debug = False

def sanitizeTypes(type, val):
	val = val.strip()
	if type=='email':
		return val.lower()
	elif type=='phone':
		if val[0:2] == "+1":
			val = val[2:]
		val = val.replace('(', '').replace(')', '').replace(' ', '').replace('.', '').replace('-', '')
		return val

def exportAddressBook():
	print "Reading address book...",
	sys.stdout.flush()
	import address_reader
	ab = address_reader.addressBookToList()
	print "done"
	sys.stdout.flush()
	gv = ['email', 'phone']
	ar={}
	sar = {}
	ln = len(ab)
	lb = 0
	for n, a in enumerate(ab):
		msg = "Exporting address book: %d/%d" % (n, ln)
		lb = len(msg)
		if not debug:
			print '\b'*(lb+2),
			sys.stdout.flush()
			print msg,
			sys.stdout.flush()
		if 'last' not in a.keys() or 'first' not in a.keys():
			continue
		gk = filter(lambda x: x in a.keys(), gv)
		nm = "%s %s" % (a['first'], a['last'])
		il = []
		sil = []
		for k in gk:
			if isinstance(a[k], list):
				for z in a[k]:
					sil.append(z)
					il.append(sanitizeTypes(k, z))
			else:
				sil.append(a[k])
				il.append(sanitizeTypes(k, a[k]))
		il = list(set(il))
		sil = list(set(sil))
		ar[nm] = il
		sar[nm] = sil
	print '\b'*(lb+2),
	msg = "Exporting address book: %d/%d" % (ln, ln)
	print msg
	print "Writing json file...",
	json.dump(ar, open('address_book.js', 'w'))
	json.dump(sar, open('address_book_raw.js', 'w'))
	print "done"

if __name__=="__main__":
	exportAddressBook()
