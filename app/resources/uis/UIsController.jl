module UIsController
using Genie.Renderer

function homepage()
  html!(:uis, :homepage)
end

function start()
  html!(:uis, :start)
end
end
