function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

jQuery(document).ready( function() {

  $('#subscribeOptIn').on('change', function(e) {
      fetch(`https://api.hirezstudios.com/acct/subscribe`, 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: `{
          "webToken": "${readCookie('HZAcctWebToken')}",
          "subscribe": "${e.currentTarget.checked}"
        }`
      }).then(function (response) {
        return response.json();
      }).then(function (response) {
        console.log(response);
      if (response.statusCode === 200) {
        console.log('Success')  } 
      else {
        console.log('Error');
      }
    });
  });

  if (localStorage.getItem("TwoFactorDisable") == 1) {
    $.ajax({
      type: 'POST',
      url: HZDashPanel.ajax_url+'?r='+Math.random(),
      data: {
          'action':'submit_two_factor',
          'form' : 'type=email&period=0'
      },
      cache: 'false',
      success: function(disable2fa,dev,xhr) {
        localStorage.removeItem('TwoFactorDisable');
      }
    });
  }
  // if( $('[data-search-select]').length > 0 )
  // {
  //   $('[data-search-select]').each(function(i){
  //     $(this).select2({placeholder: 'Select an option'});
  //   });
  // }
  $('#country-code').select2();

  // wait for a successful login event and reload
  if ( $('.hzdash-wrapper .hzlogin-wrapper').length>0 )
  {
    $('.hzlogin-wrapper').on('login_success', function(e)
    {
      // reload the page, where a successful login will be detected and trigger a dashboard display
      location.reload();
    });
  }

  // check if www.paladins.com for addReferrer
  var paladinsCheck = $( "body div" ).hasClass( "paladins-wrapper" );
  if (paladinsCheck === true) {
    $('.paladins-wrapper #hzdash-refferer-gameid').val('Paladins');
  }
  // let's define some stuff
  var $loginForm      = '#hzdash-login';
  var $createForm     = '#hzdash-createaccount';
  var $forgotUserForm = '#hzdash-forgotusername';
  var $forgotPassForm = '#hzdash-forgotpassword';

  var $overviewPanel     = '.panel.overview-wrapper';
  var $securityPanel     = '.panel.security-wrapper';
  var $transactionsPanel = '.panel.transactions-wrapper';
  var $rewardsPanel      = '.panel.rewards-wrapper';
  var $changePassPanel   = '.panel.changepw-wrapper';
  var $invitesPanel      = '.panel.invites-wrapper';
  var $referPanel        = '.panel.refer-wrapper';
  var $paladinsPanel     = '.panel.referpal-wrapper';
  var $hotgPanel         = '.panel.referhandofthegods-wrapper';
  var $addReferrerPanel  = '.panel.add-referrer-wrapper';
  var $linksPanel        = '.panel.links-wrapper';
  var $confirmLinksPanel = '.panel.confirm-link-wrapper';

  var revealForm = function(formSel) {
    if ( $(formSel).length === 0) {
      // reveal the generic view instead
      if ( $('.hzdash-wrapper .form-wrapper.float').length > 0 ) {
        revealForm( $loginForm );
      } else if ( $('.panel-wrapper .panel').length > 0 ) {
        revealPanel( $overviewPanel );
      }
      return false;
    }
    var tl = new TimelineMax({'delay':0.25});
    tl.to( $('.form-wrapper').find( 'form' ), 0.3, { 'autoAlpha' : 0 } );
    tl.to( $('.form-wrapper'), 0.3, { 'height' : $(formSel).outerHeight(true) } );
    tl.to( $(formSel), 0.3, { 'autoAlpha' : 1 }, '-=0.15' );
    tl.play();
  };
  var revealPanel = function(panelSel) {
    var tl = new TimelineMax({'delay':0.25});
    $('.panel').css('autoAlpha',0).css('z-index',-1).css('pointer-events','none');
    tl.to( $('.panel-wrapper'), 0.3, { 'height' : ($(panelSel).outerHeight(true) + 200) } );
    tl.to( $(panelSel), 0.3, { 'autoAlpha' : 1, 'z-index' : 1, 'pointer-events' : 'auto' }, '-=0.15' );
    tl.play();

    window.setTimeout(function() {
      if (panelSel == '.panel.links-wrapper' && $(panelSel).css('z-index') == 1) {
        loadPaladinsFB();
      }
    }, 1000);
  };

  if ( $('[data-targetform]').length > 0 ) {
    $('[data-targetform]').each( function(i) {
      $(this).on( 'click', function(e){
        e.preventDefault();
        var targetForm = $(this).data('targetform');
        $('[data-targetpanel]').removeClass('current');
        revealForm('#'+targetForm);
      });
    });
  }

  if ( $('[data-targetpanel]').length > 0 ) {
    $('[data-targetpanel]').each( function(i) {
      $(this).on( 'click', function(e){
        e.preventDefault();
        var targetForm = $(this).data('targetpanel');
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+targetForm+'"]').addClass('current');
        revealPanel(targetForm);
      });
    });
  }

  // handle unlink action

  $( ".start-unlink" ).click(function() {
    var service = $(this).data('service');
    $(this).parent().addClass('is-hidden');
    $('.links-wrapper .single-service.'+ service +' .small-10 .state-confirm-unlink').removeClass('is-hidden');
  });

  $(".start-mixer-unlink").click(function () {
    var service = $(this).data('service');
    $(this).parent().parent().addClass('is-hidden');
    $('.links-wrapper .single-service.' + service + ' .small-10 .state-linked').removeClass('is-hidden')
  });

  $(".confirm-abandon").click(function() {
    var service = $(this).data('service');
    $(this).parent().parent().addClass('is-hidden');
    $('.links-wrapper .single-service.'+ service +' .small-10 .state-unlinked').removeClass('is-hidden');
    history.pushState('', document.title, window.location.pathname + '#link');
  });

  $(".confirm-abandon-unlink").click(function() {
    var service = $(this).data('service');
    $(this).parent().parent().addClass('is-hidden');
    $('.links-wrapper .single-service.'+ service +' .small-10 .state-linked').removeClass('is-hidden');
  });

  //joins multiple objects together to deliver the payload to the response log.
  function extend(obj, src) {
    Object.keys(src).forEach(function(key) { obj[key] = src[key]; });
    return obj;
  }
  // handle the reveal of the url hash if defined
  if ( window.location.hash ) {
    var hash = window.location.hash.split('?')[0];
    var activeService;
    if ( window.location.hash.substring(1,5) == 'link' ) {
      hash = '#link';
      activeService = "twitch";
    }
    if (activeService == "twitch") {
      var hashes = window.location.hash.split("&");
      if ( hashes[0] ) {
        var twitchAccessToken = hashes[0].substring(11);
        if ( twitchAccessToken ) {
          $.ajax({
            type: "POST",
            url: 'https://api.twitch.tv/kraken/oauth2/token',
            data: 'client_id=t11hnc4bu1xj2yljd1t4dbruut4srkf&client_secret=yf5mm2yj17n0wv7uo8qpjnbcaz1r6x&grant_type=authorization_code&redirect_uri=https://www.hirezstudios.com/my-account/#link&code='+twitchAccessToken,
            success: function (response) {
              fullResponse1 = JSON.parse(JSON.stringify(response));
              var fullReponse1Obj = response;
              var auth_token = response.access_token;
              var refresh_token = response.refresh_token;
              $.ajax({
                type: "GET",
                url: 'https://api.twitch.tv/kraken/user?oauth_token='+ auth_token,
                async: true,
                dataType: "jsonp",
                success: function (response, textStatus, xhr) {
                  fullResponse = JSON.parse(JSON.stringify(response));
                  var fullReponse2Obj = response;
                  var twitchID = fullResponse._id;
                  var twitchName = fullResponse.display_name;
                  if ( twitchID ) {
                    history.pushState('', document.title, window.location.pathname + '#link');
                    $('.links-wrapper .single-service.twitch .small-10 .single-state').addClass("is-hidden");
                    $('.links-wrapper .single-service.twitch .small-10 .state-confirm-link').removeClass("is-hidden");
                    $('.links-wrapper .single-service.twitch .small-10 .state-confirm-link strong').text(twitchName);
                    $('.links-wrapper .single-service.twitch .small-10 .state-confirm-link input[name=service-account]').val(twitchID);
                    $('.links-wrapper .single-service.twitch .small-10 .state-confirm-link input[name=service-name]').val("twitch");
                    $('.links-wrapper .single-service.twitch .small-10 .state-confirm-link input[name=service-token]').val(auth_token);
                    $('.links-wrapper .single-service.twitch .small-10 .state-confirm-link input[name=refresh-token]').val(refresh_token);
                    function readCookie(name) {
                        var nameEQ = name + "=";
                        var ca = document.cookie.split(';');
                        for(var i=0;i < ca.length;i++) {
                            var c = ca[i];
                            while (c.charAt(0)==' ') c = c.substring(1,c.length);
                            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
                        }
                        return null;
                    }
                    var joinedObjects = extend(fullReponse1Obj, fullReponse2Obj);
                    var payload = JSON.stringify(joinedObjects);
                    payload = payload.replace(/\"/g, "'");
                    var status = xhr.status.toString();
                    $.ajax({
                      type: 'POST',
                      url: 'https://acct.hirezstudios.com/api/info/log',
                      data: {
                        responseCode: status,
                        payLoad: payload,
                        dateTime: new Date().toLocaleString()
                      }
                    });
                    var hrzAcctID = readCookie("HZAcctID");
                    $.ajax({
                      type: "PUT",
                      url: 'https://api.twitch.tv/kraken/user/vhs?identifier=HR'+hrzAcctID+'&api_version=5&client_id=t11hnc4bu1xj2yljd1t4dbruut4srkf&oauth_token='+auth_token,
                    });
                  }
                },
                error: function(error, textStatus, xhr) {
                  var joinedObjects = extend(fullReponse1Obj, fullReponse2Obj);
                  var payload = JSON.stringify(joinedObjects);
                  var status = xhr.status.toString()
                      
                  payload = payload.replace(/\"/g, "'");
                  $.ajax({
                    type: 'POST',
                    url: 'https://acct.hirezstudios.com/api/info/log',
                    data: {
                      responseCode: status,
                      payLoad: payload,
                      dateTime: new Date().toLocaleString()
                    }
                  });
                }
              });
            }
          });
        }
      }
    }
    var hashToDOMMap = {
      '#login'           : function() { revealForm('#hzdash-login'); },
      '#create-account'  : function() { revealForm('#hzdash-createaccount'); },
      '#forgot-username' : function() { revealForm('#hzdash-forgotusername'); },
      '#forgot-password' : function() { revealForm('#hzdash-forgotpassword'); },

      '#overview'        : function() {
        revealPanel($overviewPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$overviewPanel+'"]').addClass('current');
      },
      '#transactions'    : function() {
        revealPanel($transactionsPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$transactionsPanel+'"]').addClass('current');
      },
      '#security'    : function() {
        revealPanel($securityPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$securityPanel+'"]').addClass('current');
      },
      '#rewards'         : function() {
        revealPanel($rewardsPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$rewardsPanel+'"]').addClass('current');
      },
      '#change-password' : function() {
        revealPanel($changePassPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$changePassPanel+'"]').addClass('current');
      },
      '#invitations' : function() {
        revealPanel($invitesPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$invitesPanel+'"]').addClass('current');
      },
      '#referafriend' : function() {
        revealPanel($referPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$referPanel+'"]').addClass('current');
      },
      '#link' : function() {
        revealPanel($linksPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$linksPanel+'"]').addClass('current');
      },
      '#confirmlink' : function() {
        revealPanel($confirmLinksPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$confirmLinksPanel+'"]').addClass('current');
      },
      '#referpaladins' : function() {
        revealPanel($paladinsPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$paladinsPanel+'"]').addClass('current');
      },
      '#referhandofthegods' : function() {
        revealPanel($hotgPanel);
        $('[data-targetpanel]').removeClass('current');
        $('[data-targetpanel="'+$hotgPanel+'"]').addClass('current');
      },
      '#addreferrer' : function() {
        if ( $($addReferrerPanel).length > 0 ) {
          revealPanel($addReferrerPanel);
        } else {
          revealForm('#hzdash-login');
        }
      }

    };
    var hashFunction = hashToDOMMap[hash];
    if ( typeof( hashFunction ) != 'undefined' ) {
      hashFunction();
    }
  } else {

    // let's do some stuff, too
    if ( $('.hzdash-wrapper .form-wrapper.float').length > 0 ) {
      revealForm( $loginForm );
    }

    if ( $('.panel-wrapper .panel').length > 0 ) {
      revealPanel( $overviewPanel );
    }
  }

  // validate the form(s)
  if ( $('#hzdash-login').length > 0 ) {
     $('#hzdash-login').validate();
  }
  if ( $('#hzdash-logout').length > 0 ) {
     $('#hzdash-logout').validate();
  }
  if ( $('#change-pw').length > 0 ) {
    $('#change-pw').validate({
      'rules' : {
        'hzdash-new-pass': 'required',
        'hzdash-confirm-new': {
          'equalTo' : '#hzdash-new-pass'
        }
      }
    });
  }
  if ( $('#hzdash-createaccount').length > 0 ) {
     $('#hzdash-createaccount').validate({
      'rules' : {
        'hzdash-create-pass' : 'required',
        'hzdash-create-pass-again' : {
          'equalTo' : '#hzdash-create-pass'
        },
        'hzdash-create-overthirteen': {
            'required' : true,
        }
      },
      'messages' : {
          'hzdash-create-overthirteen': {
            'required' : 'You must be over 13 years of age.'
          }
      }
    });
  }
  if ( $('#hzdash-forgotusername').length > 0 ) {
     $('#hzdash-forgotusername').validate();
  }
  if ( $('#hzdash-forgotpassword').length > 0 ) {
     $('#hzdash-forgotpassword').validate();
  }

  // handle the closing of a notification, if present
  if ( $('.hz-notice-fixed').length > 0 ) {
    $('.hz-notice-fixed .close-btn').one('click',function(e){
      TweenMax.to( $('.hz-notice-fixed'), 0.3, { 'autoAlpha' : 0, 'onComplete' : function(e) {
        $('.hz-notice-fixed').remove();
      }});
    });
  }

  if( $('#hzdash-twofactor').length > 0 )
  {
    if( $('.mobile-btn').length > 0 )
    {
      $('.mobile-btn').on('click', function(e)
      {
        e.preventDefault();
        var panelHeight = $('.panel-wrapper').height();
        if( !$('#hzdash-addmobile').hasClass('active') )
        {
          $('#hzdash-addmobile').addClass('active');
          $('.panel-wrapper').height(panelHeight+50);
        }
        else
        {
          $('#hzdash-addmobile').removeClass('active');
          $('.panel-wrapper').height(panelHeight-50);
        }
      });
    }
    $('#hzdash-twofactor').validate({
      submitHandler : function()
      {
        $('.two-factor-message').removeClass('active').removeClass('error').removeClass('success');
        var panelHeight = $('.panel-wrapper').height();
        // submit form asynchronously
        var serialized = $('#hzdash-twofactor').find('input, select').serialize();

        // attempt to login
        $.ajax({
          type: 'POST',
          url: HZDashPanel.ajax_url+'?r='+Math.random(),
          data: serialized,
          cache: 'false',
          success: function(data)
          {
            var verifyTwoFactor = JSON.parse(data);
            if( verifyTwoFactor.status === 'success' )
            {
              $('.two-factor-message p').text(verifyTwoFactor.success_message);
              $('.two-factor-message').addClass('success');
            }
            else
            {
              $('.two-factor-message p').text(verifyTwoFactor.error_message);
              $('.two-factor-message').addClass('error');
              if( verifyTwoFactor.notify_method === 'phone' )
              {
                $('#hzdash-addmobile').addClass('active');
                $('.panel-wrapper').height(panelHeight+50);
              }
            }
          }
        });
      }
    });
  }

  if( $('#hzdash-addmobile').length > 0 )
  {
    $('#hzdash-addmobile').validate({
      submitHandler : function()
      {
        var panelHeight = $('.panel-wrapper').height();
        // submit form asynchronously
        var serialized = $('#hzdash-addmobile').find('input, select').serialize();
        // attempt to login
        $.ajax({
          type: 'POST',
          url: HZDashPanel.ajax_url+'?r='+Math.random(),
          data: serialized,
          cache: 'false',
          success: function(data)
          {
            var addMobile = JSON.parse(data);
            if(addMobile.status === 'success')
            {
              $('.add-mobile-message p').text(addMobile.success_message);
              $('.add-mobile-message').addClass('success');
            }
            else
            {
              $('.add-mobile-message p').text(addMobile.error_message);
              $('.add-mobile-message').addClass('error');
            }
          }
        });
      }
    });
  }


  $('#hzdash-security-login').on('submit', function(e){
    var formData = $(this).serialize();
    $.ajax({
        type: 'POST',
        url: HZDashPanel.ajax_url+'?r='+Math.random(),
        cache: 'false',
        data: {
            'action':'login_verify',
            'form' : formData
        },
        success:function(loginVerify, brandonTest, xhr) {
          var currentUser = $('.info-node.account-username p').text();
          var loggedUser = loginVerify.username;
          if (loginVerify.hasOwnProperty('errors')) {
            if (loginVerify.errors.response_code == 403) {
              if (loginVerify.errors.response_body[0] == false) {
                $('.response-wrapper').text('A verification code has been sent to you. Please enter it below.').removeClass('error').addClass('success');
                $('.security-wrapper .two-factor-login').show();
              } else {
                $('.response-wrapper').text('Validation failed. Please check your two factor code and try again.').removeClass('success').addClass('error');
                $('.security-wrapper .two-factor-login').show();
              }
            } else {
              var listErrors = JSON.parse(loginVerify.errors.response_body);
              $('.response-wrapper').text(listErrors.errors).removeClass('success').addClass('error');
            }
          } else if (currentUser == loggedUser) {
            $.ajax({
              type: 'POST',
              url: HZDashPanel.ajax_url+'?r='+Math.random(),
              data: {
                  'action':'view_2fa_settings'
              },
              cache: 'false',
              success: function(view) {
                $('.panel-wrapper').height(840);
                $('.security-wrapper.panel').html(view);
              }
            });
            $.ajax({
              type: 'POST',
              url: HZDashPanel.ajax_url+'?r='+Math.random(),
              data: {
                  'action':'get_two_factor_info'
              },
              cache: 'false',
              success: function(settings2fa) {
                var valPeriod = null;
                if (settings2fa.validationOption == 'SMS') {
                  valPeriod = 'phone';
                } else {
                  valPeriod = settings2fa.validationOption;
                }
                sessionStorage.setItem('currentBackupEmail',settings2fa.backupEmail);
                sessionStorage.setItem('currentValidPeriod',settings2fa.validationPeriod);
                sessionStorage.setItem('currentNotifyMethod',valPeriod);
                sessionStorage.setItem('currentPhoneNumber',settings2fa.phone);
                if (settings2fa.validationPeriod.length > 0) {
                  var populatePeriod;
                  if (settings2fa.validationPeriod == "NONE") {
                    populatePeriod = 0;
                  } else if (settings2fa.validationPeriod == "PERIODIC") {
                    populatePeriod = 1;
                  } else {
                    populatePeriod = 2;
                  }
                  $('select[name="period"]').val(populatePeriod);
                }
                if (settings2fa.validationOption.length > 0) {
                  var populateMethod = valPeriod.toLowerCase();
                  $('select[name="type"]').val(populateMethod);
                }
              }
            });
          } else {
            $('.response-wrapper').text('An error has occurred. Please try again.').removeClass('success').addClass('error');
          }
        },
        error: function(errorThrown){
        }
    });
      e.preventDefault();
  });

  // function to populate confirmation view
  function populateConfirmView(prop) {
    if (prop) {
      $('.twofa-confirmation-wrapper .disable-changes-made').show();
      $('.twofa-confirmation-wrapper .copy-wrapper').hide();
      var formData = "type=email&period=0";
      $.ajax({
        type: 'POST',
        url: HZDashPanel.ajax_url+'?r='+Math.random(),
        data: {
            'action':'submit_two_factor',
            'form' : formData
        },
        cache: 'false',
        success: function(submit2fa,dev,xhr) {
        }
      });
    } else {
      var showSaveSettings = null;
      if (sessionStorage.newNotifyMethod != null) {
        var currNotify = sessionStorage.currentNotifyMethod.toLowerCase();
        var newNotify  = sessionStorage.newNotifyMethod;
        if (currNotify != newNotify) {
          $('.twofa-confirmation-wrapper .notification-method').show();
          $('.notification-method .old').text(currNotify);
          $('.notification-method .new').text(newNotify);
          showSaveSettings = 1;
        }
      }
      if(sessionStorage.newValidPeriod != null) {
        var currValid = sessionStorage.currentValidPeriod.toLowerCase();
        var newValid = sessionStorage.newValidPeriod;
        var wordnewValid = null;
        if (newValid == 0) {
          wordnewValid = 'none';
        } else if (newValid == 1) {
          wordnewValid = 'periodic';
        } else {
          wordnewValid = 'everytime';
        }
        if (currValid != wordnewValid) {
          $('.twofa-confirmation-wrapper .validation-period').show();
          $('.validation-period .old').text(currValid);
          $('.validation-period .new').text(wordnewValid);
          showSaveSettings = 1;
        }
      }
      if (sessionStorage.newPhone != undefined) {
        $('.twofa-confirmation-wrapper .new-phone').show();
        $('.new-phone .new').text(sessionStorage.newPhone);
        showSaveSettings = 1;
      }
      if (sessionStorage.newEmail != undefined) {
        $('.twofa-confirmation-wrapper .new-backup').show();
        $('.new-backup .new').text(sessionStorage.newEmail);
        showSaveSettings = 1;
      }
      if (showSaveSettings == 1) {
        $('.twofa-confirmation-wrapper .save-settings').show();
      } else {
        sessionStorage.setItem('confirmationView',1);
      }
      if (sessionStorage.confirmationView == 1) {
        $('.twofa-confirmation-wrapper .no-changes-made').show();
      }
    }
  }

  // user saves two factor settings
  $( ".twofa-settings-submit" ).live( "click", function(e) {
    var notificationMethod = $('select[name="type"]').val();
    var validationPeriod = $('select[name="period"]').val();
    sessionStorage.setItem('newNotifyMethod',notificationMethod);
    sessionStorage.setItem('newValidPeriod',validationPeriod);
    if (sessionStorage.newValidPeriod == 0) {
      sessionStorage.setItem('confirmationView',1);
      $.ajax({
        type: 'POST',
        url: HZDashPanel.ajax_url+'?r='+Math.random(),
        data: {
            'action':'view_2fa_confirmation'
        },
        cache: 'false',
        success: function(view) {
          $('.security-wrapper.panel').html(view);
          populateConfirmView('disabled');
        }
      });
    } else if (sessionStorage.newNotifyMethod == "phone") {
      sessionStorage.setItem('confirmationView',3);
      $.ajax({
        type: 'POST',
        url: HZDashPanel.ajax_url+'?r='+Math.random(),
        data: {
            'action':'view_2fa_add_phone'
        },
        cache: 'false',
        success: function(view) {
          $('.security-wrapper.panel').html(view);
          if (sessionStorage.currentPhoneNumber != 'null') {
            $('.twofa-add-phone-wrapper .current-settings').show();
            $('.twofa-add-phone-wrapper .current-settings span').text(sessionStorage.currentPhoneNumber);
          }
        }
      });
    } else {
      sessionStorage.setItem('confirmationView',4);
      $.ajax({
        type: 'POST',
        url: HZDashPanel.ajax_url+'?r='+Math.random(),
        data: {
            'action':'view_2fa_email'
        },
        cache: 'false',
        success: function(view) {
          $('.security-wrapper.panel').html(view);
          $.ajax({
            type: 'POST',
            url: HZDashPanel.ajax_url+'?r='+Math.random(),
            data: {
                'action':'get_hrz_account_info'
            },
            cache: 'false',
            success: function(hrzinfo) {
              $('.twofa-email-wrapper .current-email').text(hrzinfo.contactInfo.email);
            }
          });
        }
      });
    }
    e.preventDefault();
  });

  // user wants to bail
  $( ".twofa-email-wrapper .change-email").live( "click", function(e) {
    var revealPanel = function(panelSel) {
      var tl = new TimelineMax({'delay':0.25});
      $('.panel').css('autoAlpha',0).css('z-index',-1).css('pointer-events','none');
      tl.to( $('.panel-wrapper'), 0.3, { 'height' : ($(panelSel).outerHeight(true) + 200) } );
      tl.to( $(panelSel), 0.3, { 'autoAlpha' : 1, 'z-index' : 1, 'pointer-events' : 'auto' }, '-=0.15' );
      tl.play();
    };
    e.preventDefault();
    var targetForm = '.panel.changeemail-wrapper';
    $('[data-targetpanel]').removeClass('current');
    $('[data-targetpanel="'+targetForm+'"]').addClass('current');
    revealPanel(targetForm);
  });

  // user wants to bail
  $( ".twofa-add-phone-wrapper .cancel-add-phone").live( "click", function(e) {
    window.location.reload();
    e.preventDefault();
  });

      // user wants to bail
  $( ".twofa-verify-phone-wrapper .cancel-verify-phone").live( "click", function(e) {
     $.ajax({
        type: 'POST',
        url: HZDashPanel.ajax_url+'?r='+Math.random(),
        data: {
            'action':'view_2fa_add_phone'
        },
        cache: 'false',
        success: function(view) {
          $('.security-wrapper.panel').html(view);
          if (sessionStorage.currentPhoneNumber != 'null') {
            $('.twofa-add-phone-wrapper .current-settings').show();
            $('.twofa-add-phone-wrapper .current-settings span').text(sessionStorage.currentPhoneNumber);
          }
        }
      });
    e.preventDefault();
  });

  // user wants to bail
  $( ".twofa-verify-backup-wrapper .cancel-verify-backup").live( "click", function(e) {
    window.location.reload();
    e.preventDefault();
  });

  // user wants to bail
  $( ".twofa-confirmation-wrapper .exit-new-settings").live( "click", function(e) {
    window.location.reload();
    e.preventDefault();
  });

  // user is okay with current email
  $( ".twofa-email-wrapper .okay-email").live( "click", function(e) {
    if (sessionStorage.newNotifyMethod == "both") {
      $.ajax({
        type: 'POST',
        url: HZDashPanel.ajax_url+'?r='+Math.random(),
        data: {
            'action':'view_2fa_add_phone'
        },
        cache: 'false',
        success: function(view) {
          $('.security-wrapper.panel').html(view);
          if (sessionStorage.currentPhoneNumber != 'null') {
            $('.twofa-add-phone-wrapper .current-settings').show();
            $('.twofa-add-phone-wrapper .current-settings span').text(sessionStorage.currentPhoneNumber);
          }
        }
      });
    } else {
      $.ajax({
        type: 'POST',
        url: HZDashPanel.ajax_url+'?r='+Math.random(),
        data: {
            'action':'view_2fa_add_backup'
        },
        cache: 'false',
        success: function(view) {
          $('.security-wrapper.panel').html(view);
          if (sessionStorage.currentBackupEmail != 'null') {
            $('.twofa-add-backup-wrapper .current-settings').show();
            $('.twofa-add-backup-wrapper .current-settings span').text(sessionStorage.currentBackupEmail);
          }
        }
      });
    }
    e.preventDefault();
  });

  // populate country phone code before number field
  $('.twofa-add-phone-wrapper select').live( "change", function(e) {
    var currentCountry = $(this).children('option:selected').data('code');
    $('.twofa-add-phone-wrapper .phone-prefix').text(currentCountry);
  });

  // user add new phone
  $( ".twofa-add-phone-submit").live( "click", function(e) {
    var formData = $('#twofa-add-phone').serialize();
    var newPhone = $('#twofa-add-phone .phone').val();
    sessionStorage.setItem('newPhone',newPhone);
    var checkNumber = $.isNumeric(newPhone);
    if (checkNumber == true) {
      $.ajax({
        type: 'POST',
        url: HZDashPanel.ajax_url+'?r='+Math.random(),
        data: {
            'action':'add_mobile',
            'form' : formData
        },
        cache: 'false',
        success: function(addphoneres,dev,xhr) {
          if (xhr.status == 200) {
            $.ajax({
              type: 'POST',
              url: HZDashPanel.ajax_url+'?r='+Math.random(),
              data: {
                  'action':'view_2fa_verify_phone'
              },
              cache: 'false',
              success: function(view) {
                $('.security-wrapper.panel').html(view);
              }
            });
          } else {
            $('.twofa-add-phone-wrapper .response-wrapper').text('An error has occurred').addClass('error').css('margin-bottom','20px');
          }
        }
      });
    } else {
      $('.twofa-add-phone-wrapper .response-wrapper').text('Phone number must contain numeric characters only.').addClass('error').css('margin-bottom','20px');
    }
    e.preventDefault();
  });

  // verify phone number
  $( ".twofa-verify-phone-submit").live( "click", function(e) {
    var formData = $('#twofa-verify-phone').serialize();
    $.ajax({
      type: 'POST',
      url: HZDashPanel.ajax_url+'?r='+Math.random(),
      data: {
          'action':'validate_mobile',
          'form' : formData
      },
      cache: 'false',
      success: function(verifyphoneres,dev,xhr) {
        if (verifyphoneres != null) {
          var listErrors = JSON.parse(verifyphoneres.errors.response_body);
          $('.response-wrapper').text(listErrors.errors).removeClass('success').addClass('error');
        } else {
          $.ajax({
            type: 'POST',
            url: HZDashPanel.ajax_url+'?r='+Math.random(),
            data: {
                'action':'view_2fa_add_backup'
            },
            cache: 'false',
            success: function(view) {
              $('.security-wrapper.panel').html(view);
              if (sessionStorage.currentBackupEmail != 'null') {
                $('.twofa-add-backup-wrapper .current-settings').show();
                $('.twofa-add-backup-wrapper .current-settings span').text(sessionStorage.currentBackupEmail);
              }
            }
          });
        }
      }
    });
    e.preventDefault();
  });

  // add backup email
  $( ".twofa-add-backup-submit").live( "click", function(e) {
    var formData = $('#twofa-add-backup').serialize();
    var newEmail = $('#twofa-add-backup .email').val();;
    sessionStorage.setItem('newEmail',newEmail);
    $.ajax({
      type: 'POST',
      url: HZDashPanel.ajax_url+'?r='+Math.random(),
      data: {
          'action':'set_backup_email',
          'form' : formData
      },
      cache: 'false',
      success: function(addbackup,dev,xhr) {
        if (addbackup == null && xhr.status == 200) {
          $.ajax({
            type: 'POST',
            url: HZDashPanel.ajax_url+'?r='+Math.random(),
            data: {
                'action':'view_2fa_verify_backup'
            },
            cache: 'false',
            success: function(view) {
              $('.security-wrapper.panel').html(view);
            }
          });
        } else {
          var listErrors = JSON.parse(addbackup.errors.response_body);
          $('.twofa-add-backup-wrapper .response-wrapper').text(listErrors.errors).addClass('error').css('margin-bottom','20px');
        }
      }
    });
    e.preventDefault();
  });

  // verify backup email
  $( ".twofa-verify-backup-submit").live( "click", function(e) {
    var formData = $('#twofa-verify-backup').serialize();
    $.ajax({
      type: 'POST',
      url: HZDashPanel.ajax_url+'?r='+Math.random(),
      data: {
          'action':'verify_backup_email',
          'form' : formData
      },
      cache: 'false',
      success: function(addbackup,dev,xhr) {
        if (addbackup == null && xhr.status == 200) {
          $.ajax({
            type: 'POST',
            url: HZDashPanel.ajax_url+'?r='+Math.random(),
            data: {
                'action':'view_2fa_confirmation'
            },
            cache: 'false',
            success: function(view) {
              $('.security-wrapper.panel').html(view);
              populateConfirmView();
            }
          });
        } else {
          var listErrors = JSON.parse(addbackup.errors.response_body);
          $('.twofa-verify-backup-wrapper .response-wrapper').text(listErrors.errors).addClass('error').css('margin-bottom','20px');
        }
      }
    });
    e.preventDefault();
  });

  // current phone button
  $( ".twofa-add-phone-wrapper .current-settings a").live( "click", function(e) {
    $.ajax({
      type: 'POST',
      url: HZDashPanel.ajax_url+'?r='+Math.random(),
      data: {
          'action':'view_2fa_add_backup'
      },
      cache: 'false',
      success: function(view) {
        $('.security-wrapper.panel').html(view);
        if (sessionStorage.currentBackupEmail != 'null') {
          $('.twofa-add-backup-wrapper .current-settings').show();
          $('.twofa-add-backup-wrapper .current-settings span').text(sessionStorage.currentBackupEmail);
        }
      }
    });
    e.preventDefault();
    });

    // current backup email
    $( ".twofa-add-backup-wrapper .current-settings a").live( "click", function(e) {
      $.ajax({
        type: 'POST',
        url: HZDashPanel.ajax_url+'?r='+Math.random(),
        data: {
            'action':'view_2fa_confirmation'
        },
        cache: 'false',
        success: function(view) {
          $('.security-wrapper.panel').html(view);
          if (sessionStorage.currentBackupEmail != 'null') {
            $('.twofa-add-backup-wrapper .current-settings').show();
            $('.twofa-add-backup-wrapper .current-settings span').text(sessionStorage.currentBackupEmail);
            populateConfirmView();
          }
        }
      });
      e.preventDefault();
      });

  // current phone button
  $(".twofa-confirmation-wrapper .confirm-new-settings").live( "click", function(e) {
    var submitValidation = sessionStorage.newNotifyMethod;
    var submitPeriod = sessionStorage.newValidPeriod;
    var formData = 'type='+submitValidation+'&period='+submitPeriod;
    $.ajax({
      type: 'POST',
      url: HZDashPanel.ajax_url+'?r='+Math.random(),
      data: {
          'action':'submit_two_factor',
          'form' : formData
      },
      cache: 'false',
      success: function(submit2fa,dev,xhr) {
        $('.twofa-confirmation-wrapper').html('<h1>You\'ve successfully changed your two factor settings!</h1> <a class="continue">Continue</a>');
        if (sessionStorage.currentValidPeriod == 'NONE' && sessionStorage.newValidPeriod == 1 || sessionStorage.currentValidPeriod == 'NONE' && sessionStorage.newValidPeriod == 2) {
          $.ajax({
            type: 'POST',
            url: HZDashPanel.ajax_url+'?r='+Math.random(),
            data: {
                'action':'create_single_code',
                'form' : formData
            },
            cache: 'false',
            success: function(onetimecode,dev,xhr) {
              $('.twofa-confirmation-wrapper').prepend('<p>Use your one time code to gain access to your account.</p><span class="one-time-code"></span>');
              $('.twofa-confirmation-wrapper .one-time-code').text(onetimecode.code);
            }
          });
        }
      }
    });
    e.preventDefault();
    });

    $( ".twofa-confirmation-wrapper .continue").live( "click", function(e) {
      window.location.reload();
      e.preventDefault();
      });

    $( ".twofa-confirmation-wrapper .continue-settings").live( "click", function(e) {
      window.location.reload();
      e.preventDefault();
      });

      $( ".nav-item a").live( "click", function(e) {
        $('.is-loading').addClass('is-hidden');
      });

  /**
  * Facebook Auth Login
  **/
  // reference: https://developers.facebook.com/docs/facebook-login/web

  function gup( name, url ) {
    if (!url) url = location.href;
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
  }

  var linkExists = gup('link',window.location.href);
  var protectedUserID = null;
  var protectedToken = null;

  if (linkExists === 'facebook') {
    $('.is-loading').removeClass('is-hidden');
    var fbCode = gup('code',window.location.href);
    $.ajax({
      url: HZDashPanel.ajax_url+'?r='+Math.random(),
      method: 'POST',
      dataType: 'json',
      data: {
          'action':'get_access_token',
          'code' : fbCode
      },
      success:function(res_token, status, xhr) {
        protectedToken = res_token.access_token;
        $.ajax({
          url: HZDashPanel.ajax_url+'?r='+Math.random(),
          method: 'POST',
          dataType: 'json',
          data: {
              'action':'get_fb_acct_info',
              'token' : protectedToken
          },
          success:function(res_about, status, xhr) {
            protectedUserID = res_about.id;
            $.ajax({
              url: HZDashPanel.ajax_url+'?r='+Math.random(),
              method: 'POST',
              dataType: 'json',
              data: {
                  'action':'get_long_token',
                  'token' : protectedToken
              },
              success:function(data) {
                $.ajax({
                  url: HZDashPanel.ajax_url+'?r='+Math.random(),
                  method: 'POST',
                  dataType: 'json',
                  data: {
                    'action':'make_link',
                    'form' : "platformId="+ protectedUserID +"&accessToken=" + data.access_token
                  },
                  success:function(response) {
                    var parsedResponse = JSON.parse(JSON.stringify(response));
                    if (parsedResponse.hasOwnProperty('errors')) {
                      var error = JSON.parse(response.errors.response_body[0]);
                      if (error.errors[0] == "our Hi-Rez account has already been linked to your console account.") {
                        $.ajax({
                          url: HZDashPanel.ajax_url+'?r='+Math.random(),
                          method: 'POST',
                          dataType: 'json',
                          data: {
                              'action':'update_link',
                              'token' : data.access_token
                          },
                          success:function(response, status, xhr) {
                            if (xhr.status == 200) {
                              $('.is-loading').text('You\'ve successfully linked your account with Facebook.').addClass('green');
                              window.open('https://www.hirezstudios.com/my-account/#links','_self');
                            } else {
                              $('.is-loading').text('Something went wrong. Please try again!');
                            }
                          },
                          error: function(errorThrown){
                          }
                        });
                      } else {
                        $('.is-loading').text(error.errors[0]);
                      }
                    } else {
                      $('.is-loading').text('You\'ve successfully linked your account with Facebook.').addClass('green');
                      window.open('https://www.hirezstudios.com/my-account/#links','_self');
                    }
                  },
                  error: function(errorThrown){
                  }
                });
              }
            });
          },
          error: function(errorThrown){
          }
        });
      },
      error: function(errorThrown){
      }
    });
  }

  var FBUserID; // set up a global for storing the Facebook user-id
  // This is called with the results from from FB.getLoginStatus().
  var statusChangeCallback = function(response) {
    var facebookUserId = response.UserID;
    $.ajax({
      url: HZDashPanel.ajax_url+'?r='+Math.random(),
      method: 'POST',
      dataType: 'json',
      data: {
          'action':'get_long_token',
          'token' : response.authResponse.accessToken
      },
      success:function(data) {
        $.ajax({
          url: HZDashPanel.ajax_url+'?r='+Math.random(),
          method: 'POST',
          dataType: 'json',
          data: {
            'action':'make_link',
            'form' : "platformId="+ FBUserID +"&accessToken=" + data.access_token
          },
          success:function(response) {
            var parsedResponse = JSON.parse(JSON.stringify(response));
            if (parsedResponse.hasOwnProperty('errors')) {
              var error = JSON.parse(response.errors.response_body[0]);
              if (error.errors[0] == "our Hi-Rez account has already been linked to your console account.") {
                $.ajax({
                  url: HZDashPanel.ajax_url+'?r='+Math.random(),
                  method: 'POST',
                  dataType: 'json',
                  data: {
                      'action':'update_link',
                      'token' : data.access_token
                  },
                  success:function(response, status, xhr) {
                    if (xhr.status == 200) {
                      $('.facebook-error').text('You\'ve successfully linked your account with Facebook.').addClass('green');
                      window.open('https://www.hirezstudios.com/my-account/#links','_self');
                      window.location.reload();
                    } else {
                      $('.facebook-error').text('Something went wrong. Please try again!');
                    }
                  },
                  error: function(errorThrown){
                  }
                });
              } if(error.errors[0] == "This account has already been linked to a Hi-Rez account.") {
                $('.is-loading').text('This account is already linked to a Hi-Rez account.');
                setTimeout(function(){  
                  window.open('https://www.hirezstudios.com/my-account/#links','_self');
                  window.location.reload();
                }, 5000);
              } else {
                $('.facebook-error').text(error.errors[0]);
              }
            } else {
              $('.facebook-error').text('You\'ve successfully linked your account with Facebook.').addClass('green');
              window.open('https://www.hirezstudios.com/my-account/#links','_self');
              window.location.reload();
            }
          },
          error: function(errorThrown){
            console.log(errorThrown);
          }
        });
      }
    });
    // The response object is returned with a status field that lets the
    // app know the current login status of the person.
    // Full docs on the response object can be found in the documentation
    // for FB.getLoginStatus().
    if (response.status === "connected") {
      FBUserID = response.authResponse.userID;
      // Logged into your app and Facebook.
      // submit the response info to the server so that we can log this user in
      // document.getElementById('facebook_response_input').value = JSON.stringify(response);
      // get the token from the hidden field
      // var responseObj = JSON.parse(document.getElementById('facebook_response_input').value);
      // attempt to sign-in/create account via facebook
    } else if (response.status === 'not_authorized') {
      // handle the not authorized situation...
    }
  };
  
  // Cookie functions

  function createCookie(name,value,days) {
    if (days) {
      var date = new Date();
      date.setTime(date.getTime()+(days*24*60*60*1000));
      var expires = "; expires="+date.toGMTString();
    }
    else var expires = "";
    document.cookie = name+"="+value+expires+"; path=/";
  }
  
  function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  }
  
  function eraseCookie(name) {
    createCookie(name,"",-1);
  }

  // Twitch redirect_uri

  if (gup('redirect_uri',window.location.href) || readCookie('redirect_uri')) {
      if (readCookie('redirect_uri')) {
        var redirectURI = readCookie('redirect_uri');
      } else {
        var redirectURI = gup('redirect_uri',window.location.href);
      }
      if(redirectURI === 'https://twitch.amazon.com/prime/loot/paladins?ctx=account-link' || redirectURI === 'https%3A%2F%2Ftwitch.amazon.com%2Fprime%2Floot%2Fpaladins%3Fctx%3Daccount-link') {
        createCookie('redirect_uri',redirectURI,.025);
        $('.single-service.facebook').hide();
        $('.single-rewards.facebook-rewards').hide();
        $('.smite-logo.smite').hide();
        $('.rewards-intercept.twitch').show();
        $('.login-wrapper .with-consoles').addClass('hide-twitch');
        $('.login-wrapper .with-consoles .console-intercept').addClass('hide-twitch');
        $('.step-info').show();
        if ($('.twitch-name span').text().length > 0) {
          var twitchUserName = $('.twitch-name span').text();
          $('.twitch-popup p strong').text(twitchUserName);
          $('.twitch-popup').removeClass('is-hidden');
          $('.backdrop').removeClass('is-hidden');
        }
        $( ".twitch-popup .yes" ).click(function() {
          var redirect_uri_fetch = readCookie('redirect_uri');
          eraseCookie('redirect_uri');
          window.location.href = redirect_uri_fetch;
        });
        $( ".reward-link a" ).click(function() {
          var redirect_uri_fetch = readCookie('redirect_uri');
          eraseCookie('redirect_uri');
          window.location.href = redirect_uri_fetch;
        });
        $( ".twitch-popup .no" ).click(function() {
          setTimeout(function(){ 
            $('.close-btn').click();
          }, 500);
          $('.twitch-popup').addClass('is-hidden');
          $('.backdrop').addClass('is-hidden');
          $('.single-service.twitch .start-unlink').click();
        });
        $( ".twitch-popup .console" ).click(function() {
          setTimeout(function(){ 
            $('.close-btn').click();
          }, 500);
          $('.twitch-popup').addClass('is-hidden');
          $('.backdrop').addClass('is-hidden');
        });
      }
  }

  //This is the appID for Paladins
  function loadPaladinsFB() {
    window.fbAsyncInit = function() {
      FB.init({
        appId      : 968092606547648,
        autoLogAppEvents : true,
        xfbml            : true,
        version          : 'v2.10'
      });
      FB.AppEvents.logPageView();
    };

    // Load the facebook SDK asynchronously
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));

    var fbLogin = document.getElementById('fb-link');
    if (fbLogin != null) {
      fbLogin.addEventListener('click', loginWithFB);
    }
  }

});