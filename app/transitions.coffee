#########
# Index #
#########

#########
# About #
#########

#############   #####################
# Companies #   # Companies.company #
#############   #####################

############
# Contacts #
############

TransitionMap = ->
  @transition @fromRoute("index"),
    @toRoute("about"),
    @use("toUp"),
    @reverse("toDown")

  @transition @fromRoute("index"),
    @toRoute("companies"),
    @use("toUp"),
    @reverse("toDown")

  @transition @fromRoute("index"),
    @toRoute("companies"),
    @use("toUp"),
    @reverse("toDown")

  @transition @fromRoute("index"),
    @toRoute("contacts"),
    @use("toUp"),
    @reverse("toDown")


  @transition @fromRoute("about"),
    @toRoute("companies"),
    @use("toUp"),
    @reverse("toDown")

  @transition @fromRoute("about"),
    @toRoute("contacts"),
    @use("toUp"),
    @reverse("toDown")


  @transition @fromRoute("companies"),
    @toRoute("contacts"),
    @use("toUp"),
    @reverse("toDown")

  @transition @fromRoute("companies.index"),
    @toRoute("companies.company"),
    @use("toLeft"),
    @reverse("toRight")

`export default TransitionMap`