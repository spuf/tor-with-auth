Feature: container

  Scenario: system is not using Tor
    When I send request to "https://check.torproject.org/?lang=en_US"
    Then request is successful
    And response contains "Sorry. You are not using Tor."

  Scenario: proxy is using Tor
    Given container is running
    And container logs has "Tor has successfully opened a circuit"
    And proxy is used
    And proxy auth is "user:pass"
    When I send request to "https://check.torproject.org/?lang=en_US"
    Then request is successful
    And response contains "Congratulations. This browser is configured to use Tor."

  Scenario: proxy resolves onion domains
    Given container is running
    And container logs has "Tor has successfully opened a circuit"
    And proxy is used
    And proxy auth is "user:pass"
    When I send request to "http://facebookcorewwwi.onion"
    Then request is successful
    And response contains "Facebook"

  Scenario: proxy errors with invalid user
    Given container is running
    And container logs has "Tor has successfully opened a circuit"
    And proxy is used
    And proxy auth is "root"
    When I send request to "https://check.torproject.org"
    Then request is failed

  Scenario: proxy errors without user
    Given container is running
    And container logs has "Tor has successfully opened a circuit"
    And proxy is used
    When I send request to "https://check.torproject.org"
    Then request is failed

  Scenario: proxy waits Tor is ready
    Given container is running
    And proxy is used
    And proxy auth is "user:pass"
    When I send request to "https://check.torproject.org/?lang=en_US"
    Then request is successful
    And response contains "Congratulations. This browser is configured to use Tor."

  Scenario: health check
    Given container is running
    And container health status is changed
    Then container health failing streak is 0
    And container health status is "healthy"
