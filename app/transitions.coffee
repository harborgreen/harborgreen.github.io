#########  #########  #############
# Index #  # About #  # Companies # 
#########  #########  ############# 

TransitionMap = ->
  @transition @fromRoute("index"),
    @toRoute("about"),
    @use("toLeft"),
    @reverse("toRight")

  @transition @fromRoute("index"),
    @toRoute("companies"),
    @use("toLeft"),
    @reverse("toRight")

  @transition @fromRoute("about"),
    @toRoute("companies"),
    @use("toLeft"),
    @reverse("toRight")

  @transition @fromRoute("companies.index"),
    @toRoute("companies.company"),
    @use("toLeft"),
    @reverse("toRight")

`export default TransitionMap`