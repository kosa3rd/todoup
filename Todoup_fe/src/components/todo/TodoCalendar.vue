<template>
  <div class="w-100">
    <div class="d-flex justify-content-between align-items-center todo-calendar-top">
      <div class="todo-calendar">TODO 캘린더</div>
      <div class="add-todo-wrap">
        <button type="button" class="px-2 add-todo" @click="handleAddTodo">
          <font-awesome-icon :icon="['fas', 'check-double']" /> TODO 추가
        </button>
      </div>
    </div>

    <full-calendar :options="calendarOptions"> </full-calendar>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import FullCalendar from '@fullcalendar/vue3';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import koLocale from '@fullcalendar/core/locales/ko';
import axios from 'axios';

export default {
  components: {
    'full-calendar': FullCalendar,
  },
  computed: {
    ...mapState('user', {
      userId: (state) => state.user_info.userId,
    }),
    ...mapState('todo', {
      todos: 'todo_info',
      todays: 'today_info',
    }),
    ...mapGetters('todo', {
      allTodos: 'allTodos',
    }),

    fetchTodos() {
      return this.todos.map((todo) => {
        return {
          title: todo.title,
          start: todo.start_date,
          end: this.formatEndDate(todo.end_date),
          completed: todo.completed,
          todoId: todo.todo_id,
        };
      });
    },
    calendarOptions() {
      // calendarOptions를 computed로 이동
      return {
        plugins: [dayGridPlugin, interactionPlugin],
        initialView: 'dayGridMonth',
        headerToolbar: {
          left: 'title',
          center: '',
          right: 'prev today next',
        },
        dateClick: this.handleMoveToTodo,
        eventClick: this.handleEventClick,
        eventOrder: 'completed',
        events: this.fetchTodos, // computed로부터 직접 참조
        height: 550,
        locale: koLocale,
        dayCellContent: (args) => ({ html: args.dayNumberText.replace('일', '') }),
        datesSet: this.handleDatesSet,
        eventContent: this.renderEventContent,
        dayMaxEvents: 2,
      };
    },
  },
  data() {
    return {
      currentMonth: '', // 현재 월과 연도 저장
    };
  },
  created() {
    this.setInitialMonth(); // 초기 월과 연도 설정
    this.loadCalendarData();
  },
  methods: {
    setInitialMonth() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0'); // 현재 월을 0부터 시작하므로 1을 더함
      this.currentMonth = `${year}-${month}`;
    },
    handleMoveToTodo(info) {
      this.$router.push(`/todo/${info.dateStr}`);
    },
    handleEventClick(info) {
      if (!this.userId) {
        this.$swal
          .fire({
            text: '로그인이 필요합니다.',
            icon: 'warning',
            confirmButtonText: '확인',
            confirmButtonColor: '#f39c12',
          })
          .then(() => {
            this.$router.push('/login');
          });
      } else {
        const date = new Date(info.event.start); // Date 객체 생성
        date.setDate(date.getDate() + 1); // 1일 추가
        const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
        const todoId = info.event.extendedProps.todoId;
        this.$router.push(`/todo/${dateStr}?selectedTodoId=${todoId}`);
      }
    },
    handleAddTodo() {
      if (!this.userId) {
        this.$swal
          .fire({
            text: '로그인이 필요합니다.',
            icon: 'warning',
            confirmButtonText: '확인',
            confirmButtonColor: '#f39c12',
          })
          .then(() => {
            this.$router.push('/login');
          });
      } else {
        this.$router.push('/todo/create');
      }
    },
    async loadCalendarData() {
      if (this.userId) {
        try {
          const userId = this.userId;
          const response = await axios.get(`/api/todo/month/${this.currentMonth}`, {
            params: { userId },
          });
          this.$store.commit('todo/SET_TODOS', response.data);

          const kor_time = new Date();

          const month =
            kor_time.getFullYear() +
            '-' +
            (kor_time.getMonth() + 1 < 10 ? '0' + (kor_time.getMonth() + 1) : kor_time.getMonth() + 1);

          const today =
            kor_time.getFullYear() +
            '-' +
            (kor_time.getMonth() + 1 < 10 ? '0' + (kor_time.getMonth() + 1) : kor_time.getMonth() + 1) +
            '-' +
            kor_time.getDate();

          if (this.currentMonth == month) {
            const todayTodos = this.todos.filter(
              (todo) => todo.start_date.split(' ')[0] <= today && today <= todo.end_date.split(' ')[0]
            );
            this.$store.commit('todo/SET_TODAYS', todayTodos);
          }
        } catch (error) {
          console.error('Error fetching todos:', error);
        }
      } else {
        //this.setExampleEvents(); // 로그인하지 않은 경우 예시 이벤트 설정
        this.$router.push('/example');
      }
    },
    formatEndDate(endDate) {
      // 종료 날짜를 다음 날로 설정하여 이벤트 범위에 포함되도록 함
      const date = new Date(endDate);
      date.setDate(date.getDate() + 2);
      return date.toISOString().split('T')[0]; // YYYY-MM-DD 형식으로 변환
    },
    handleDatesSet(arg) {
      const year = arg.view.currentStart.getFullYear();
      const month = String(arg.view.currentStart.getMonth() + 1).padStart(2, '0'); // getMonth() + 1으로 올바른 월 얻기
      this.currentMonth = `${year}-${month}`;
      this.loadCalendarData(); // 월 설정될 때마다 할일 목록 불러오기
    },
    renderEventContent(eventInfo) {
      return {
        html: `
          <div class="todo-event ${eventInfo.event.extendedProps.completed ? 'completed' : ''}">
            <span class="todo-title">${eventInfo.event.title}</span>
          </div>
        `,
      };
    },
  },
};
</script>
<style>
.w-100 {
  width: 100% !important;
  height: 610px !important;
}

.todo-calendar-top {
  color: #2b2222b8 !important;
  font-weight: 600;
  font-size: 16px;
  display: flex;
  justify-content: center;
  padding: 7px 0;
  border-bottom: 2px solid #cfcece70;
  border-top: 2px solid #cfcece70;
  justify-content: center;
}

.todo-calendar {
  left: 39%;
  position: relative;
}

.add-todo-wrap {
  position: absolute;
}

.add-todo {
  position: relative;
  top: 3.8em;
  width: 105px;
  height: 30px;
  background-color: #e5e5e51f;
  color: #544545;
  border: 1px solid #1d13132e;
  font-weight: 600;
  font-size: 12px;
  border-radius: 20px;
  z-index: 99;
}

.add-todo :hover {
  cursor: pointer;
}

.todo-event {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px;
  border-radius: 4px;
  background-color: #fddd0a36;
  border: 1px solid #cfb50952;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  position: relative;
  cursor: pointer;
}

.todo-event.completed {
  color: #333;
  background-color: #e0e0e096;
  text-decoration: line-through;
  border: 1px solid #f1f2f3;
}

.todo-title {
  font-weight: bold;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.fc-daygrid-more-link.fc-more-link {
  color: #3333338c;
  margin-top: 1px;
  font-size: 9px;
  font-weight: 600;
}

.fc-h-event {
  background-color: #ffffff !important;
  border: none !important;
}

.fc .fc-daygrid-day-bottom {
  font-size: 0.85em !important;
  margin: 0px 2px !important;
  position: absolute !important;
  top: -20px !important;
}

.fc .fc-daygrid-day-frame {
  min-height: 74px !important;
  position: relative !important;
}

.fc .fc-popover-title {
  font-size: 12px !important;
  margin: 6px 10px !important;
  font-weight: 600 !important;
}

.fc .fc-more-popover .fc-popover-body {
  min-width: 186px !important;
  padding: 8px 8px;
}

.fc-theme-standard .fc-popover {
  max-height: 180px !important;
  overflow-y: auto !important;
  background: var(--fc-page-bg-color) !important;
  border: 1px solid var(--fc-border-color) !important;
}

.fc .fc-popover {
  box-shadow: rgba(0, 0, 0, 0.15) 0px 2px 6px !important;
  position: absolute !important;
  z-index: 9999 !important;
  min-height: 180px !important;
}

.root {
  --fc-today-bg-color: rgb(238 231 100 / 15%);
}
</style>
