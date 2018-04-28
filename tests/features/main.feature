Feature: Test container
  Scenario: test onion router
    Given run container
    Given wait "Tor has successfully opened a circuit" in logs
# Given set proxy auth "user:pass"
# When send request "http://facebook.onion"
# Then request code 200
# And request contains "Facebook"
