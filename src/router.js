import Main from './views/Main.vue';

export const loginRouter = {
  path: '/login',
  name: 'login',
  meta: {
    title: '登录'
  },
  component: resolve => { require(['./views/login.vue'], resolve); }
};

export const page404 = {
  path: '/*',
  name: 'error_404',
  meta: {
    title: '404-页面不存在'
  },
  component: resolve => { require(['./views/error_page/404.vue'], resolve); }
};

export const page401 = {
  path: '/401',
  meta: {
    title: '401-权限不足'
  },
  name: 'error_401',
  component: resolve => { require(['./views/error_page/401.vue'], resolve); }
};

export const page500 = {
  path: '/500',
  meta: {
    title: '500-服务端错误'
  },
  name: 'error_500',
  component: resolve => { require(['./views/error_page/500.vue'], resolve); }
};

export const otherRouter = {
  path: '/',
  name: 'otherRouter',
  redirect: '/home',
  component: Main,
  available: true,
  children: [
    { path: 'home', title: '首页', name: 'home_index', available: true, component: resolve => { require(['./views/home/home.vue'], resolve); } },
    { path: 'ownspace', title: '个人中心', name: 'ownspace_index', available: true, component: resolve => { require(['./views/own-space/own-space.vue'], resolve); } },
    { path: 'message', title: '消息中心', name: 'message_index', available: true, component: resolve => { require(['./views/message/message.vue'], resolve); } }
  ]
};

export const preview = {
  path: '/preview',
  name: 'preview',
  component: resolve => { require(['./views/form/article-publish/preview.vue'], resolve); }
};

export const locking = {
  path: '/locking',
  name: 'locking',
  component: resolve => { require(['./views/main_components/locking-page.vue'], resolve); }
};

export const appRouter = [
  {
    path: '/component',
    icon: 'social-buffer',
    name: 'component',
    title: '组件',
    component: Main,
    available: true,
    children: [
      {
        path: 'text-editer',
        icon: 'compose',
        name: 'text-editer',
        title: '富文本编辑器',
        available: true,
        component: resolve => { require(['./views/my_components/text-editer/textEditer.vue'], resolve); }
      },
      {
        path: 'quill-editor',
        icon: 'compose',
        name: 'quill-editor',
        title: 'quill富文本编辑器',
        available: true,
        component: resolve => { require(['./views/my_components/quill-editor/quillEditor.vue'], resolve); }
      },
      {
        path: 'md-editor',
        icon: 'pound',
        name: 'md-editor',
        title: 'Markdown编辑器',
        available: true,
        component: resolve => { require(['./views/my_components/markdown-editor/markdown-editor.vue'], resolve); }
      },
      {
        path: 'draggable-list',
        icon: 'arrow-move',
        name: 'draggable-list',
        title: '可拖拽列表',
        available: true,
        component: resolve => { require(['./views/my_components/draggable-list/draggable-list.vue'], resolve); }
      },
      {
        path: 'file-upload',
        icon: 'android-upload',
        name: 'file-upload',
        title: '文件上传',
        available: true,
        component: resolve => { require(['./views/my_components/file-upload/file-upload.vue'], resolve); }
      },
      {
        path: 'count-to',
        icon: 'arrow-graph-up-right',
        name: 'count-to',
        title: '数字渐变',
        available: true,
        component: resolve => { require(['./views/my_components/count-to/count-to.vue'], resolve); }
      }
    ]
  },
  {
    path: '/form',
    icon: 'android-checkbox',
    name: 'form',
    title: '表单编辑',
    component: Main,
    available: false,
    children: [
      { path: 'artical-publish', title: '文章发布', name: 'articalpublish', available: true, icon: 'compose', component: resolve => { require(['./views/form/article-publish/article-publish.vue'], resolve); } },
      { path: 'workflow', title: '工作流', name: 'workflow', available: true, icon: 'arrow-swap', component: resolve => { require(['./views/form/work-flow/work-flow.vue'], resolve); } }

    ]
  },
  // {
  //     path: '/charts',
  //     icon: 'ios-analytics',
  //     name: 'charts',
  //     title: '图表',
  //     component: Main,
  //     available: true,
  //     children: [
  //         { path: 'pie', title: '饼状图', name: 'pie', icon: 'ios-pie', available: true, component: resolve => { require('./views/access/access.vue') },
  //         { path: 'histogram', title: '柱状图', name: 'histogram', icon: 'stats-bars', available: true, component: resolve => { require('./views/access/access.vue') }

  //     ]
  // },
  {
    path: '/tables',
    icon: 'ios-grid-view',
    name: 'tables',
    title: '表格',
    component: Main,
    available: false,
    children: [
      { path: 'dragableTable', title: '可拖拽排序', name: 'dragableTable', icon: 'arrow-move', available: true, component: resolve => { require(['./views/tables/dragable-table.vue'], resolve); } },
      { path: 'editableTable', title: '可编辑表格', name: 'editableTable', icon: 'edit', available: true, component: resolve => { require(['./views/tables/editable-table.vue'], resolve); } },
      { path: 'exportableTable', title: '表格导出数据', name: 'exportableTable', icon: 'code-download', available: true, component: resolve => { require(['./views/tables/exportable-table.vue'], resolve); } },
      { path: 'table2image', title: '表格转图片', name: 'table2image', icon: 'images', available: true, component: resolve => { require(['./views/tables/table-to-image.vue'], resolve); } }
    ]
  },
  {
    path: '/error-page',
    icon: 'android-sad',
    title: '错误页面',
    name: 'errorpage',
    component: Main,
    available: false,
    children: [
      { path: 'index', title: '错误页面', name: 'errorpage_index', icon: 'android-sad', available: true, component: resolve => { require(['./views/error_page/error-page.vue'], resolve); } }
    ]
  },
  {
    path: '/picture',
    icon: 'images',
    name: 'picture',
    title: '图片管理',
    component: Main,
    available: true,
    children: [
      { path: 'upload', title: '上传图片', name: 'picture_upload', icon: 'upload', available: true, component: resolve => { require(['./views/picture/upload.vue'], resolve); } },
      { path: 'repository', title: '图片库', name: 'picture_repository', icon: 'android-image', available: true, component: resolve => { require(['./views/picture/repository.vue'], resolve); } },
      { path: 'category', title: '图片分类', name: 'picture_category', icon: 'android-list', available: true, component: resolve => { require(['./views/picture/category.vue'], resolve); } },
      { path: 'tag', title: '图片标签', name: 'picture_tag', icon: 'flag', available: true, component: resolve => { require(['./views/picture/tag.vue'], resolve); } },
      { path: 'color', title: '图片颜色', name: 'picture_color', icon: 'android-color-palette', available: true, component: resolve => { require(['./views/picture/color.vue'], resolve); } }
    ]
  },
  {
    path: '/activity',
    icon: 'ios-paper',
    name: 'activity',
    title: '活动管理',
    component: Main,
    available: true,
    children: [
      { path: 'add', title: '新建活动', name: 'activity_add', icon: 'plus', available: true, component: resolve => { require(['./views/activity/add.vue'], resolve); } },
      { path: 'edit/:event_id', title: '编辑活动', name: 'activity_edit', icon: 'plus', available: false, component: resolve => { require(['./views/activity/edit.vue'], resolve); } },
      { path: 'list', title: '活动列表', name: 'activity_list', icon: 'ios-keypad', available: true, component: resolve => { require(['./views/activity/list.vue'], resolve); } },
      { path: 'link', title: '活动推广', name: 'extend_link', icon: 'paper-airplane', available: true, component: resolve => { require(['./views/activity/link.vue'], resolve); } },
      { path: 'analysis', title: '推广统计', name: 'extend_analysis', icon: 'ios-analytics', available: true, component: resolve => { require(['./views/activity/analysis.vue'], resolve); } }
    ]
  },
  {
    path: '/banner',
    icon: 'android-image',
    name: 'banner',
    title: 'Banner管理',
    component: Main,
    available: true,
    children: [
      { path: 'banner', title: 'Banner管理', name: 'banner_index', icon: 'android-image', available: true, component: resolve => { require(['./views/banner/banner.vue'], resolve); } }
    ]
  },
  {
    path: '/user',
    icon: 'person-stalker',
    name: 'user',
    title: '用户管理',
    component: Main,
    available: true,
    children: [
      { path: 'all', title: '所有用户', name: 'user_all', icon: 'android-contacts', available: true, component: resolve => { require(['./views/user/all.vue'], resolve); } },
      { path: 'cert', title: '认证管理', name: 'user_cert', icon: 'android-contact', available: true, component: resolve => { require(['./views/user/cert.vue'], resolve); } },
      { path: 'auth', title: '第三方绑定', name: 'user_auth', icon: 'android-textsms', available: true, component: resolve => { require(['./views/user/auth.vue'], resolve); } }
    ]
  },
  {
    path: '/message',
    icon: 'android-textsms',
    name: 'message',
    title: '消息管理',
    component: Main,
    available: true,
    children: [
      { path: 'list', title: '消息管理', name: 'message_list', icon: 'android-textsms', available: true, component: resolve => { require(['./views/message/list.vue'], resolve); } }
    ]
  },
  {
    path: '/access',
    icon: 'lock-combination',
    name: 'access',
    title: '权限控制',
    component: Main,
    available: true,
    children: [
      { path: 'menu', title: '菜单管理', name: 'access_menu', icon: 'android-menu', available: true, component: resolve => { require(['./views/access/menu.vue'], resolve); } },
      { path: 'role', title: '角色管理', name: 'access_role', icon: 'settings', available: true, component: resolve => { require(['./views/access/role.vue'], resolve); } },
      { path: 'user', title: '用户管理', name: 'access_user', icon: 'person-add', available: true, component: resolve => { require(['./views/access/user.vue'], resolve); } }
    ]
  },
  {
    path: '/access-test',
    icon: 'lock-combination',
    title: '权限测试页',
    name: 'accesstest',
    access: 0,
    component: Main,
    available: false,
    children: [
      { path: 'index', title: '权限测试页', name: 'accesstest_index', icon: 'lock-combination', available: true }
    ]
  }
];

export const routers = [
  loginRouter,
  otherRouter,
  preview,
  locking,
  ...appRouter,
  page500,
  page401,
  page404
];
