window.addEventListener('DOMContentLoaded', function () {
  const imaScript = document.createElement('script');
  imaScript.src = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
  imaScript.async = true;
  imaScript.onload = setupIMA;
  document.head.appendChild(imaScript);

  function setupIMA() {
    const videoContainer = document.createElement('div');
    videoContainer.id = 'video-player-container';
    videoContainer.style.position = 'fixed';
    videoContainer.style.bottom = '20px';
    videoContainer.style.right = '20px';
    videoContainer.style.width = '320px';
    videoContainer.style.height = '180px';
    videoContainer.style.zIndex = '9999';
    videoContainer.style.backgroundColor = 'black';
    videoContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    document.body.appendChild(videoContainer);

    const video = document.createElement('video');
    video.id = 'content-video';
    video.width = 320;
    video.height = 180;
    video.setAttribute('playsinline', '');
    video.setAttribute('controls', '');
    video.src = 'https://storage.googleapis.com/interactive-media-ads/media/android.mp4';
    videoContainer.appendChild(video);

    const adContainer = document.createElement('div');
    adContainer.id = 'ad-container';
    adContainer.style.position = 'absolute';
    adContainer.style.top = '0';
    adContainer.style.left = '0';
    adContainer.style.width = '100%';
    adContainer.style.height = '100%';
    adContainer.style.zIndex = '1000';
    videoContainer.appendChild(adContainer);

    const playButton = document.createElement('button');
    playButton.innerText = '';
    playButton.style.position = 'absolute';
    playButton.style.bottom = '10px';
    playButton.style.left = '10px';
    playButton.style.zIndex = '1001';
    playButton.style.width = '50px'; 
    playButton.style.height = '50px';
    playButton.style.background = 'transparent';
    playButton.style.border = 'none';
    playButton.style.opacity = '0';
    playButton.style.cursor = 'default';
    playButton.style.pointerEvents = 'auto';

    videoContainer.appendChild(playButton);

    videoContainer.addEventListener('mouseenter', () => {
      playButton.style.opacity = '1';
    });
    videoContainer.addEventListener('mouseleave', () => {
      playButton.style.opacity = '0';
    });

    let adIsPlaying = false;
    let adsManager = null;

    const adDisplayContainer = new google.ima.AdDisplayContainer(adContainer, video);
    const adsLoader = new google.ima.AdsLoader(adDisplayContainer);
    const adsRequest = new google.ima.AdsRequest();
    adsRequest.adTagUrl =
      'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/single_ad_samples&ciu_szs=300x250&impl=s&gdfp_req=1&env=vp&output=vast&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ct%3Dlinear&correlator=';

    adsRequest.linearAdSlotWidth = 320;
    adsRequest.linearAdSlotHeight = 180;
    adsRequest.nonLinearAdSlotWidth = 320;
    adsRequest.nonLinearAdSlotHeight = 150;

    adsLoader.addEventListener(
      google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
      onAdsManagerLoaded,
      false
    );

    adsLoader.addEventListener(
      google.ima.AdErrorEvent.Type.AD_ERROR,
      function (error) {
        console.error('Ad error:', error.getError());
        video.play();
      },
      false
    );

    playButton.addEventListener('click', () => {
      if (adIsPlaying) {
        if (adsManager) {
          adsManager.pause();
          adIsPlaying = false;
        }
      } else {
        adDisplayContainer.initialize();
        adsLoader.requestAds(adsRequest);
        adIsPlaying = true;
      }
    });

    function onAdsManagerLoaded(adsManagerLoadedEvent) {
      adsManager = adsManagerLoadedEvent.getAdsManager(video);

      adsManager.addEventListener(google.ima.AdErrorEvent.Type.AD_ERROR, (error) => {
        console.error('Ad Manager Error:', error.getError());
        video.play();
      });

      adsManager.addEventListener(google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED, () => {
        adIsPlaying = false;
        video.play();
      });

      adsManager.addEventListener(google.ima.AdEvent.Type.STARTED, () => {
        adIsPlaying = true;
      });

      try {
        adsManager.init(320, 180, google.ima.ViewMode.NORMAL);
        adsManager.start();
      } catch (e) {
        console.error('AdsManager start error:', e);
        video.play();
      }
    }
  }
});
