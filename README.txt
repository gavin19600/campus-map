캠퍼스 지도 (브이월드 실사 3D판) — 공개하는 방법

들어 있는 파일
- index.html : 지도 사이트 본체 (대학 231곳 자료 포함)
- config.js  : 브이월드 인증키를 넣는 파일 (처음엔 비어 있음)

1단계. 무료 사이트 주소 만들기 (GitHub Pages)
 1) github.com 에 가입합니다.
 2) 오른쪽 위 + → New repository → 이름을 campus-map 처럼 정하고 Public으로 만듭니다.
 3) "uploading an existing file"을 눌러 index.html, config.js 두 파일을 끌어다 놓고 Commit changes.
 4) 저장소의 Settings → Pages → Source를 "Deploy from a branch", Branch를 main / (root)로 두고 Save.
 5) 1~2분 뒤 https://(GitHub 아이디).github.io/campus-map/ 주소가 생깁니다.
    이 주소로 들어가면 "브이월드 인증키를 넣어 주세요" 안내가 보이면 정상입니다.

2단계. 브이월드 인증키 받기
 1) vworld.kr 에 가입하고 로그인합니다.
 2) 오픈API → 인증키 발급을 엽니다.
 3) 서비스 URL에 1단계에서 생긴 주소(https://아이디.github.io)를 적고,
    활용할 API 목록에서 3D 지도(WebGL) 항목을 고른 뒤 신청합니다. (공공데이터포털 기준 자동승인)
 4) 발급된 키(영문·숫자와 - 로 된 긴 문자열)를 복사합니다.

3단계. 키 넣기
 1) GitHub 저장소에서 config.js를 열고 연필(Edit) 아이콘을 누릅니다.
 2) window.VWORLD_KEY = "";  의 따옴표 안에 키를 붙여 넣고 Commit changes.
 3) 1~2분 뒤 사이트를 새로고침하면 실제 지형과 건물 3D가 나옵니다.

안 될 때
- "3D 지도를 불러오지 못했습니다"가 보이면 대부분 서비스 URL이 실제 주소와 다른 경우입니다.
  브이월드 마이페이지 → 인증키 관리에서 주소를 고치세요.
- 인증키는 사이트 주소에 묶여 있어서, 웹페이지에 보여도 다른 사이트에서는 쓸 수 없습니다.

자료 출처
- 대학 위치: 교육부 「대학교 주소기반 좌표정보」(공공데이터포털, 2025.11.26 갱신, 이용허락 제한 없음)
- 3D 지도: 국토교통부 브이월드 (화면 아래 로고 표시 유지)
