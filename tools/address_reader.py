from AddressBook import *
import pprint

def addressBookToList():
        """
        Read the current user's AddressBook database, converting each person
        in the address book into a Dictionary of values. Some values (addresses,
        phone numbers, email, etc) can have multiple values, in which case a
        list of all of those values is stored. The result of this method is
        a List of Dictionaries, with each person represented by a single record
        in the list.
        """
        # get the shared addressbook and the list of
        # people from the book.
        ab = ABAddressBook.sharedAddressBook()
        people = ab.people()

        peopleList = []

        # convert the ABPerson to a hash
        for person in people:
                thisPerson = {}
                props = person.allProperties()
                for prop in props:

                        # skip some properties
                        if prop == "com.apple.ABPersonMeProperty":
                            continue
                        elif prop == "com.apple.ABImageData":
                            continue

                        # How we convert the value depends on the ObjC
                        # class used to represent it
                        val = person.valueForProperty_(prop)
                        if type(val) == objc.pyobjc_unicode:
                                # Unicode String
                                thisPerson[prop.lower()] = val
                        elif issubclass(val.__class__, NSDate):
                                # NSDate
                                thisPerson[prop.lower()] = val.description()
                        elif type(val) == ABMultiValueCoreDataWrapper:
                                # List -- convert each item in the list
                                # into the proper format
                                thisPerson[prop.lower()] = []
                                for valIndex in range(0, val.count()):
                                        indexedValue = val.valueAtIndex_(valIndex)
                                        if type(indexedValue) == objc.pyobjc_unicode:
                                                # Unicode string
                                                thisPerson[prop.lower()].append(indexedValue)
                                        elif issubclass(indexedValue.__class__, NSDate):
                                                # Date
                                                thisPerson[prop.lower()].append(indexedValue.description())
                                        elif type(indexedValue) == NSCFDictionary:
                                                # NSDictionary -- convert to a Python Dictionary
                                                propDict = {}
                                                for propKey in indexedValue.keys():
                                                        propValue = indexedValue[propKey]
                                                        propDict[propKey.lower()] = propValue
                                                thisPerson[prop.lower()].append(propDict)
                peopleList.append(thisPerson)
        return peopleList
