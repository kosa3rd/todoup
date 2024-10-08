<template>
  <div class="w-100">
    <div class="diary-wrapper">
      <table class="diary-table">
        <tr>
          <td colspan="4">
            <div class="title">
              <div class="submit-btn">
                <button @click="submitDiary">
                  <font-awesome-icon :icon="['far', 'circle-check']" />
                  {{ isEditMode ? '수정 끝' : '일기 끝' }}
                </button>
              </div>
              <div class="diary-title">
                <div class="diary-date">{{ formattedDate }}의 일기</div>
                <div class="create-or-edit">
                  {{ isEditMode ? '수정 중' : '작성 중' }}
                </div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="2">
            <div>
              <div class="check-radiobox">오늘의 날씨</div>
              <div>
                <label for="sunny">
                  <input type="radio" id="sunny" value="sunny" v-model="weather" />
                  <font-awesome-icon :icon="['fas', 'sun']" class="fontBox" />
                </label>
                <label for="cloudy">
                  <input type="radio" id="cloudy" value="cloudy" v-model="weather" />
                  <font-awesome-icon :icon="['fas', 'cloud']" class="fontBox" />
                </label>
                <label for="rainy">
                  <input type="radio" id="rainy" value="rainy" v-model="weather" />
                  <font-awesome-icon :icon="['fas', 'cloud-showers-heavy']" class="fontBox" />
                </label>
                <label for="snowy">
                  <input type="radio" id="snowy" value="snowy" v-model="weather" />
                  <font-awesome-icon :icon="['fas', 'snowflake']" class="fontBox" />
                </label>
              </div>
            </div>
          </td>
          <td colspan="2">
            <div>
              <div class="check-radiobox">오늘의 기분</div>
              <div>
                <label for="happy">
                  <input type="radio" id="happy" value="happy" v-model="emotion" />
                  <font-awesome-icon :icon="['fas', 'smile']" class="fontBox" />
                </label>
                <label for="sad">
                  <input type="radio" id="sad" value="sad" v-model="emotion" />
                  <font-awesome-icon :icon="['fas', 'frown']" class="fontBox" />
                </label>
                <label for="angry">
                  <input type="radio" id="angry" value="angry" v-model="emotion" />
                  <font-awesome-icon :icon="['fas', 'angry']" class="fontBox" />
                </label>
                <label for="neutral">
                  <input type="radio" id="neutral" value="exhaust" v-model="emotion" />
                  <font-awesome-icon :icon="['fas', 'meh']" class="fontBox" />
                </label>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <th colspan="4">
            <span style="margin-left: 30px">오늘의 사진</span>
            <button @click="triggerBtnFileUpload" class="fileload-btn">+</button>
            <!-- + 버튼 클릭시 파일 업로드를 트리거-->
          </th>
        </tr>
        <tr>
          <td colspan="5">
            <div class="photo-upload">
              <!-- onFileChange: 파일 선택 시 fileReader를 이용해 파일을 읽고, imgData를 저장-->
              <input type="file" @change="onFileChange" ref="fileInput" style="display: none" />
              <!-- imgData가 설정되면, src를 통해서 업로드 사진을 미리보기로 표시-->
              <img v-if="imgData" :src="imgData" class="uploaded-photo" />
            </div>
          </td>
        </tr>
        <tr>
          <th colspan="5">오늘의 하루</th>
        </tr>
        <tr>
          <td colspan="5">
            <div>
              <textarea v-model="content" class="textarea"></textarea>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import axios from 'axios';

export default {
  props: {
    date: String, // URL에서 전달받은 date
    isEditMode: Boolean, // 수정 모드인지 여부
  },
  data() {
    return {
      content: '', // 다이어리 작성 내용
      weather: 'sunny',
      emotion: 'happy',
      imgData: '', // 추가한 사진
      file: null,
    };
  },
  created() {
    if (this.isEditMode) {
      this.fetchDiaryDetail();
    }
  },
  computed: {
    ...mapState('user', {
      // userId 가지고 오기
      userId: (state) => state.user_info.userId,
    }),
    formattedDate() {
      // date가 변경되면 날짜 포맷 변경
      const [year, month, day] = this.date.split('-');
      return `${year}년 ${month}월 ${day}일`;
    },
  },
  methods: {
    fetchDiaryDetail() {
      // 해당 날짜의 다이어리 데이터를 가지고 옴
      const userId = this.userId;

      axios
        .get(`/api/diary/detail/${this.date}`, {
          params: { userId },
        })
        .then((response) => {
          const diaryData = response.data;
          this.weather = diaryData.weather;
          this.emotion = diaryData.emotion;
          this.content = diaryData.content;
          this.imgData = diaryData.imageUrl ? `/api/diary/images/${diaryData.imageUrl}` : '';
        })
        .catch((error) => {
          console.error('Error fetching diary details:', error);
        });
    },
    triggerBtnFileUpload() {
      // 숨겨진 파일 입력 요소를 클릭하여 + 버튼 눌렀을 때 파일 선택 대화 상자를 표시
      this.$refs.fileInput.click(); // + 버튼을 누르면, ref=fileInput이 클릭됨
    },
    onFileChange(e) {
      // 이미지 미리보기 설정: 파일을 읽어서 img url로 생성
      // 파일을 선택(파일 입력 요소의 변화가 발생)하면 호출
      this.file = e.target.files[0]; // 선택한 파일 가져오기

      if (this.file) {
        // onload 이벤트 핸들러: 파일이 성공적으로 읽혀지면 호출
        const reader = new FileReader(); // 1. 파일을 읽기 위한 객체

        // 3. 파일이 성공적으로 읽혀지면, onload 이벤트 핸들러 발생해 읽은 데이터 처리
        reader.onload = (e) => {
          this.imgData = e.target.result; // 읽은 파일의 데이터 URL이 포함된 속성
          //this.file = file; // 실제 파일 객체 저장(DB저장시 사용)
        };

        // 2. 파일을 데이터 URL 형식으로 읽기 시작(사진 미리보기를 위해 url로 변경)
        reader.readAsDataURL(this.file);
      }
    },
    submitDiary() {
      console.log('submit 버튼 ');
      // 일기 내용을 적지 않았을 때, submit 불가
      if (this.content === null || this.content.trim() === '') {
        this.$swal.fire({
          text: '일기의 내용을 입력해주세요.',
          icon: 'warning',
          confirmButtonText: '확인',
          confirmButtonColor: '#f39c12',
        });

        return;
      }

      const diaryData = new FormData(); // FormData: 이미지 파일을 포함해서 전송시 사용하는 객체
      diaryData.append('userId', this.userId);
      diaryData.append('diaryDate', this.date);
      diaryData.append('emotion', this.emotion);
      diaryData.append('weather', this.weather);
      diaryData.append('content', this.content);

      // 파일이 선택된 경우에만 데이터 추가
      if (this.file) {
        diaryData.append('imgFile', this.file);
      }

      const request = this.isEditMode
        ? axios.post('/api/diary/update', diaryData) // isEditMode == true이면, update
        : axios.post('/api/diary/insert', diaryData); // isEditMode == false라면, insert

      request
        .then((response) => {
          // 포인트를 up하는 로직 추가
          let pointsToAdd = 0;
          if (!this.isEditMode && response.data) {
            // diary가 editmode가 아닌(insert) 경우에만 포인트 +5
            pointsToAdd = 5; // 완료시 +5 포인트
          }
          this.$store.dispatch('user/updatePoints', pointsToAdd);

          if (this.isEditMode) {
            //diary가 editmode인 경우 수정 완료 alert창
            this.$swal.fire({
              text: response.data, // 서버에서 반환된 메시지
              icon: 'info',
              confirmButtonText: '확인',
              confirmButtonColor: '#429f50',
            });
          }

          this.$router.push('/diary'); // 일기를 저장한 후, diarycalendar로 이동
        })
        .catch((error) => {
          console.error('There was an error saving the diary:', error);
        });
    },
  },
};
</script>

<style scoped>
.w-100 {
  width: 100% !important;
  height: 600px !important;
}

.diary-wrapper {
  margin: 0 auto;
  padding: 25px;
  border: 2px solid #635e5e21;
  border-radius: 12px;
}

.diary-title {
  text-align: center;
}

.diary-table {
  width: 100%;
  border-collapse: collapse;
}

.diary-table th,
.diary-table td {
  border: 2px solid #635e5e21;
  padding: 9px;
  text-align: center;
  font-size: 14px;
  color: #544d4d;
}

.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 5px;
}

.diary-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 3px;
}

.diary-date {
  flex: 1;
  font-size: 17px !important;
  font-weight: bold;
  margin-left: 42px;
}

.create-or-edit {
  border-radius: 20px;
  font-size: 9px;
  padding: 5px 12px;
  background-color: rgb(133 175 17 / 21%);
  margin-left: 13em;
}

.fontBox {
  margin-left: 8px;
  width: 15px;
  height: auto;
  color: rgba(133, 175, 17, 0.89);
  transition: color 0.25s ease-in-out;
}

.check-radiobox {
  font-weight: 600;
  margin-bottom: 8px;
}

label {
  margin-right: 10px;
}

.fileload-btn {
  border: 1px solid #80808057;
  width: 30px;
  height: 19px;
  border-radius: 20px;
  background-color: #e5dddd52;
  font-weight: 600;
  float: inline-end;
  transition: color 0.25s ease-in-out;
}

.photo-upload {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 130px;
}

.uploaded-photo {
  max-width: 100%;
  max-height: 100%;
}

.diary-image {
  width: 180px; /* 이미지 크기를 적절하게 조정 */
  height: auto;
  margin-left: 20px;
}

textarea {
  line-height: 1.7 !important;
}

.textarea {
  width: 100%;
  height: 150px;
  border: none;
  resize: none;
  font-size: 13px;
  padding: 13px;
}

.submit-btn button {
  width: 100px;
  height: 30px;
  background-color: #e5e5e56b;
  color: #544545;
  border: 2px solid #635e5e21;
  font-weight: 600;
  font-size: 12px;
  border-radius: 20px;
}
</style>
