import LoginCompo from '@/components/login/LoginCompo.vue';
import SignupCompo from '@/components/login/SignupCompo.vue';
import MainWrapperCompo from '@/components/MainWrapperCompo.vue';
import MainCompo from '@/components/MainCompo.vue';
import ViewCompo from '@/components/ViewCompo.vue';
import HomeCompo from '@/components/HomeCompo.vue';
import TodoCalendar from '@/components/TodoCalendar.vue';
import DiaryCalendar from '@/components/diary/DiaryCalendar.vue';
import DiaryEntry from '@/components/diary/DiaryRoom.vue';

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
            component: ViewCompo,
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
