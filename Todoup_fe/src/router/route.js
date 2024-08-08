import LoginCompo from '@/components/login/LoginCompo.vue';
import SignupCompo from '@/components/login/SignupCompo.vue';
import MainWrapperCompo from '@/components/MainWrapperCompo.vue';
import MainCompo from '@/components/MainCompo.vue';
import HomeCompo from '@/components/HomeCompo.vue';
import TodoCalendar from '@/components/todo/TodoCalendar.vue';
import DiaryCalendar from '@/components/DiaryCalendar.vue';
import DiaryEntry from '@/components/DiaryEntry.vue';
import RoomCompo from '@/components/room/RoomCompo.vue';
import AvatarRoom from '@/components/room/avatar/AvatarRoom.vue';
import MyReport from '@/components/room/report/MyReport.vue';
import CreateTodo from '@/components/todo/CreateTodo.vue';

export default [
  {
    path: '/',
    component: MainWrapperCompo,
    children: [
      {
        path: '/',
        component: MainCompo,
        children: [
          {
            path: '',
            component: HomeCompo,
            alias: 'calendar',
            children: [
              {
                path: '',
                component: TodoCalendar,
                alias: 'todo',
              },
              {
                path: 'todo/:date',
                component: CreateTodo,
                props: true,
              },
              {
                path: 'diary',
                name: 'DiaryCalendar',
                component: DiaryCalendar,
              },
              {
                path: 'diary/:date',
                component: DiaryEntry,
                props: true,
              },
            ],
          },
          {
            path: '/room/:ownerId',
            component: RoomCompo,
            props: true,
            children: [
              {
                path: '',
                redirect: 'avatarroom', // 기본 경로를 avatarroom으로 리다이렉트
              },
              {
                path: 'avatarroom',
                component: AvatarRoom,
                props: true, // URL 파라미터를 props로 전달
              },
              {
                path: 'report',
                component: MyReport,
                props: true,
              },
            ],
          },
        ],
      },
      {
        path: 'login',
        component: LoginCompo,
      },
      {
        path: 'signup',
        component: SignupCompo,
      },
    ],
  },
];
