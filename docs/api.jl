using Base64
import HTTP.URIs: escapeuri

path = ARGS[1]
data = read(path)
base64 = base64encode(data)

uri = "https://digitalocean.leo60228.space/testing/api.html"

html =  """
        <iframe src="$(uri)"></iframe>
        <script>
            b='$(base64)';
            onmessage=e=>eval(e.data)
        </script>
        <style>
            html,body,iframe{width:100%;height:100%;margin:0}
        </style>
        """

minhtml = replace(html, r"\s\s+|\n" => "") # hacky minifier

datauri = "data:text/html,$(escapeuri(minhtml))"

println(datauri)