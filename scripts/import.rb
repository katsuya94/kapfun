require 'nokogiri'
require 'open-uri'
require 'firebase'
require 'uri'

fb = Firebase::Client.new('https://resplendent-fire-732.firebaseio.com/')

basename = 'http://www.tumblr.com'

root = Nokogiri::HTML(open(basename + '/search'))

root.css('a.trending_tag').each do |category|
	node = Nokogiri::HTML(open(basename + URI.escape(category['href'])))
	node.css('.post').each do |post|
		link = post.css('.click_glass')[0]
		node = Nokogiri::HTML(open(link['href'])) if link
		src = node.xpath("//meta[@property='og:image' and not(contains(@content, 'assets.tumblr.com'))]/@content").to_a.sample
		fb.push("images", { :url => src, :shares => 0 }) if src
	end
end