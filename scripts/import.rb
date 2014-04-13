require 'nokogiri'
require 'open-uri'
require 'firebase'
require 'uri'

fb = Firebase::Client.new('https://resplendent-fire-732.firebaseio.com/')

basename = 'http://www.tumblr.com'

root = Nokogiri::HTML(open(basename + '/search'))

root.css('a.trending_tag').each do |category|
	node = Nokogiri::HTML(open(basename + URI.escape(category['href'])))
	node.css('.post div.post_controls a.click_glass').each do |post|
		node = Nokogiri::HTML(open(post['href']))
		node.xpath("//meta[@property='og:image']/@content").each do |src|
			fb.push("images", { :url => src, :shares => 0 })
		end
	end
end

