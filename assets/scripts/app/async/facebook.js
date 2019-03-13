/*
|--------------------------------------------------------------------------
| Facebook
|--------------------------------------------------------------------------
*/

// plugin
define(function(){

	//put here the facebook app id
	var facebook_app_id = Config.fb.app_id || null;

	return{
		load : function(name, req, onLoad, config){

			if(config.isBuild) {
			onLoad(null);
			}else{

			//debugger
			window.fbAsyncInit = function() {
				if(window.location.protocol == 'https:') {
					FB._https = true;
			}

				FB.init({
					appId     : facebook_app_id,
					channelUrl: location.protocol + "//" + location.host + "/fb_channel.php",
					status    : true,
					cookie    : true,
					xfbml     : true,
					oauth     : true
				});

				FB.Canvas.setAutoGrow();

				FB.Canvas.scrollTo(0,0);

				onLoad(FB);
			};

			(function(d){
				var js, id = 'facebook-jssdk'; if (d.getElementById(id)) {return;}
				var fbroot = d.createElement("div"); fbroot.id = "fb-root";
				d.body.appendChild(fbroot);

				js = d.createElement('script'); js.id = id; js.async = true;
				js.src = "//connect.facebook.net/en_US/all.js";
				d.getElementsByTagName('head')[0].appendChild(js);
				}(document));
			}
		}
	};
});