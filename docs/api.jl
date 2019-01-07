using Base64

function compute_api_url(data, name)
    base64 = base64encode(data)
    startpath = "https://digitalocean.leo60228.space/testing/start/"
    return "$startpath#$(basename(name)):$base64"
end

path = ARGS[1]
data = read(path)

println(compute_api_url(data, path))