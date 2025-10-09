export const navmenus = [
  {
    label: "Home",
    icon: "streamline-flex:home-2-solid",
    path: "/",
  },
  {
    label: "Create Token",
    icon: "icon-park-solid:add-one",
    path: "/create-token",
  },
  {
    label: "Open App",
    icon: "fluent:app-generic-24-filled",
    path: "/usr",
  },
]
export const sidemenus = [
  {
    label: "Main",
    path: "#",
    children: [
      {
        label: 'Dashboard',
        icon: 'material-symbols:bar-chart-rounded',
        path:'/usr'
      }
    ]
  },
  {
    label: "Projects",
    path: "#",
    children: [
      {
        label:'My Projects',
        icon:'hugeicons:blockchain-03',
        path:'/usr/my-project'
      },
      {
        label:'Create Project',
        icon:'hugeicons:blockchain-02',
        path:'/usr/my-project/create'
      },
    ]
  },
  {
    label: "Market",
    path: "#",
    children: [
      {
        label:'Projects',
        icon:'bxs:collection',
        path:'/usr/projects'
      },
      {
        label:'Presale',
        icon:'icons8:buy',
        path:'/usr/presale'
      },
      {
        label: 'Airdrop',
        icon: 'streamline-plump:parachute-drop-solid',
        path: '/usr/airdrop'
      },
      {
        label: 'Faucet',
        icon: 'fa-solid:faucet',
        path: '/faucet'
      },
    ]
  },
  {
    label: "Profile",
    path: "#",
    children: [
      {
        label:'Account',
        icon:'la:user-tag',
        path:'/usr/me'
      },
    ]
  },
]