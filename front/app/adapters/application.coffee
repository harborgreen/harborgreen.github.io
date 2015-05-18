`import ETD from 'ember-tumblr-data'`

ApplicationAdapter = ETD.TumblrAdapter.extend
  # If you're reading this code (why would you?),
  # yes, the below is a real tumblr apiKey (aka oauth token)
  # please don't steal / abuse it
  apiKey: "NWuLW6BklHitWoKijif1DlLKUAd2fP8WbhPuNJKBhBGQTaaNfj"
  namespace: 'v2/blog/mlrecycling.tumblr.com'

`export default ApplicationAdapter`