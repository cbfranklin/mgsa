
$(function(){
	var submitted = false;
	
	$('#hidden_iframe').load(function(){
		if(submitted = true){
			$('#feedback-form').fadeOut(600,function(){
				$('#thanks').delay(1000).fadeIn(600); 
			});
		}
	});
	
	$('#feedback-form').submit(function(){
		submitted = true;
	});
	
	$('.addresses,#feedback').html('');
	$('form input, form select').val('');
		
	$('#searchSwitch button').click(function(){
	//$('#searchSwitch li a').click(function(){
		$('#searches > form,#searches > div, #keyContacts').hide(); 
		$('#searchSwitch button').removeClass('active'); 
		var id = $(this).attr('id'); 
		$('#searches .'+id).show(); 
		$(this).addClass('active'); 
		if(id === 'staffDirectory'){
			$('#results').show();
		}
		else if(id === 'byTopic'){
			$('#results').show();
			$('#keyContacts').show();
		}
		else{
			$('#results').hide();
		}
		$('.addresses,#feedback').html('');
		$('form input, form select').val('');
	});
	$('#search,#groupSearch').click(function(){
		staffDirectorySearch();
		return false;
	});
	$('.display-mode .cards').click(function(){
		$('ul.addresses').addClass('cards');
		$('.display-mode .cards').addClass('active');
		$('.display-mode .list').removeClass('active'); 
	});
	$('.display-mode .list').click(function(){
		$('ul.addresses').removeClass('cards');
		$('.display-mode .list').addClass('active');
		$('.display-mode .cards').removeClass('active'); 
	});
	
	if(window.location.href.indexOf('?feedback') > 0){
		$('button#feedbackForm').click();
		console.log('?FEEDBACK');
	}
	//$('.prevSearches').on('click', 'li a', function(){
	//	n = $(this).parent('li').attr('id').split('h');
	//	search(prevSearches[n[1]].request());
	//	giveFeedback(prevSearches[n[1]].feedback());
	//	$('html, body').animate({
	//    	scrollTop: $('#results').offset().top
	//    }, 500);
	//	return false;
	//});
	
	/*toggleCards();
	$(window).resize(function(){
		toggleCards();
	});
*/
});
/*function toggleCards(){
	if($(window).width() > 479){
		$('ul.addresses').addClass('cards');
	}
	else{
		$('ul.addresses').removeClass('cards');
	}
}*/
function staffDirectorySearch(){
	$('#load').show();
	$('.addresses,.feedback').fadeOut();
	$('.addresses').html('');
	theQuery = new Query($('#lastName').val(),$('#firstName').val(),$('#state').val(),$('#zip').val(),$('#contactGroup').val());
	console.log(theQuery.request());
	giveFeedback(theQuery.feedback());
	
	search(theQuery.request());
	//prevSearches.push(theQuery);
	//showPrevSearches(prevSearches);
	$('html, body').animate({
		scrollTop: $('#results').offset().top
	}, 500);
};
function Query(lastName, firstName, state, zip, contactGroup){

	if(lastName.length > 0){
		this.lastNameR = '/ln/'+lastName;
		this.lastName = lastName;
	}
	else{this.lastNameR='',this.lastName='';}
	
	if(firstName.length > 0){
		this.firstNameR = '/fn/'+firstName;
		this.firstName = firstName;
	}
	else{this.firstNameR='',this.firstName='';}
	
	if(state !== 'none'){
		this.stateR = '/st/'+state;
		this.state = state;
	}
	else{this.stateR='',this.state='';}
	
	if(zip.length > 0){
		this.zipR = '/zip/'+zip;
		this.zip = zip;
	}
	else{this.zipR='',this.zip='';}
	
	this.request = function(){
		if(contactGroup === 'none'){
			return baseURL+this.firstNameR+this.lastNameR+this.stateR+this.zipR;
		}
		else{
			return groupURL+'/'+contactGroup;
		}
	};
	this.isGroup = function(){
		if(contactGroup === 'none'){
			return false;
		}
		else{
			return true;
		}
	}
	this.feedback = function(){
		if(contactGroup === 'none'){
			return this.lastName+' '+this.firstName+' '+this.state+' '+this.zip;
		}
		else{
			return contactGroup.split('%20').join(' ');
		}
	};
};

function search(theRequest){
	$.getJSON(theRequest,function(json){
		console.log(json);
		
		if(theQuery.isGroup() === true){
			if(json.gsaContactGroup[0] === undefined){
				console.log('NO RESULTS');
				loaded(false);
				return;
			}
			else{
				var data = json.gsaContactGroup[0].gsaAssociate;
			}
		}
		else{
			var data = json.gsaAssociate;
		}
		
		if(data.length == 0){
			console.log('NO RESULTS');
			loaded(false);
			return;
		}
		
		$.each(data, function(i, p) {
			var cardID = 'card'+i;
			$(addressCard).appendTo('.addresses').attr('id',cardID);
			$('.addresses #'+cardID+' .name .name').html(p.firstName+' '+p.lastName);
			$('.addresses #'+cardID+' .name .title').html(p.title);
			if (p.streetAddress != null){
				if (p.roomNumber != null){
					roomNumber = '<br>Room: '+p.roomNumber			
				}
				else{
					roomNumber = '';
				}
				$('.addresses #'+cardID+' .address .address').html(p.streetAddress+'<br>'+p.city+', '+p.state+', '+p.zip+roomNumber);
			}
			if (p.emailAddress != null){
				$('.addresses #'+cardID+' .address .email a').html(p.emailAddress).attr('href','mailto:'+p.emailAddress);
			}
			if (p.phoneNumber != null || p.faxNumber != null){
				//Prevents duplicate appended telephone numbers in previous searches, for now.
				$('.addresses #'+cardID+' div.tel').remove();
				$(telEntry).insertAfter('.addresses #'+cardID+' div.address');
				if (p.phoneNumber != null){
					$('.addresses #'+cardID+' span.tel strong').html('Tel: ');
					$('.addresses #'+cardID+' span.tel a').html(formatNumber(p.phoneNumber)).attr('href','tel:1'+p.phoneNumber);
				}
				if (p.faxNumber != null){
					$('.addresses #'+cardID+' span.fax strong').html('Fax: ');
					$('.addresses #'+cardID+' span.fax a').html(formatNumber(p.faxNumber)).attr('href','tel:1'+p.faxNumber);
				}
			}
		},
		loaded());
	})
	.error(function(){loaded(false)});
};
function giveFeedback(feedback){
	$('.feedback').html('Your Search: "'+feedback+'"');
};
//Some numbers are already formatted in the database.
function formatNumber(n){
	if (n.indexOf('(') > 0 || n.indexOf('-') > 0){
		return n;
	}
	else{
		return '('+n.substring(0,3)+') '+n.substring(3,6)+'-'+n.substring(6,10);
	}
};
function loaded(success){
	if(success == false){
		$('.addresses').html('<h4>No Results.</h4>');
	}
	else{$('.addresses h4').remove()}
	if($('.addresses').length <= 1){
		$('#load').fadeOut();
	}
	else{
		$('#load').slideUp();
	}
	$('.addresses,.feedback').fadeIn();
	
	//Reset Group Menu
	$('#contactGroup').val(0);
};
//function showPrevSearches(prevSearches){
//	if(prevSearches.length >= 2){
//		$('.prevSearches').show();
//	}
//	$('.prevSearches li').remove();
//	$.each(prevSearches, function(i,s){
//		$('<li><a></a></li>').insertAfter('.prevSearches h4').attr('id','search'+i);
//		$('.prevSearches #search'+i+' a').html('<i class="icon-chevron-right"></i>'+s.feedback());
//	});
//};



var baseURL = root + '/api/rs/a',
groupURL = root + '/api/rs/group',
//prevSearches = [],
addressCard = '<li><div class="top"><a href="#"><img alt="GSA" src="http://www.gsa.gov/graphics/staffoffices/GSAStarMarkweblogopolicy3333.jpg"></a><div class="name"><span class="name"></span><span class="title"></span></div></div><div class="bottom"><div class="address"><span class="address"></span><span class="email"><a href="mailto:"></a></span></div></div></li>',
telEntry = '<div class="tel"><span class="tel"><strong></strong><a href=""></a></span><span class="fax"><strong></strong><a href="tel+1"></a></span></div>';