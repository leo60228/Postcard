using Genie.Router
using UIsController

route("/", UIsController.homepage)

route("/start", UIsController.start, named=:start)
