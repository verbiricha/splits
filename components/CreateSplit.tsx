import { useRef, useState } from 'react'
import type { FC } from 'react'

import { CloseCircleOutlined, CheckCircleOutlined, LoadingOutlined } from '@ant-design/icons'

import formStyles from '../styles/Forms.module.css'
import styles from './CreateSplit.module.css'

const LOADING = 'LOADING'
const NOT_FOUND = 'NOT_FOUND'
const ERROR = 'ERROR'
const VALID_USER = 'VALID_USER'

type SearchUserState = typeof LOADING | typeof NOT_FOUND | typeof ERROR | typeof VALID_USER

interface SearchUserProps {
  isDisabled: boolean
  onUserChange: (u: string) => void
  onUser: (u: string) => void
}

const SearchUser: FC<SearchUserProps> = ({ isDisabled, onUserChange, onUser }) => {
  const [user, setUser] = useState('')
  const [users, setUsers] = useState<Record<string, SearchUserState>>({})

  const searchUser = (name: string) => {
    setUsers({...users, [name]: LOADING })
    fetch(`/api/user/${name}`)
      .then((res) => {
        if (res.status === 404) {
          setUsers({...users, [name]: NOT_FOUND })
          return
        }
        return res.json()
      })
      .then((user) => {
        if (user) {
          setUsers({...users, [name]: VALID_USER})
          onUser(user)
        }
      })
      .catch(({ error }) => {
        setUsers({...users, [name]: ERROR})
      })
  }

  const changeUser = (name: string) => {
    onUserChange(name)
    setUser(name)
    if (!users[name] && name !== ''){
      searchUser(name)
    }
  }

  const getIcon = (state: SearchUserState) => {
    switch(state) {
      case LOADING:
        return <LoadingOutlined style={{ color: '#E8FF52' }} />
      case NOT_FOUND:
      case ERROR:
        return <CloseCircleOutlined style={{ color: '#FF3529' }} />
      case VALID_USER:
        return <CheckCircleOutlined style={{ color: '#2AD544' }} />
      default:
        return null
    }
  }

  return (
    <div className={formStyles.iconInput}>
      <label
        className={formStyles.label}
        htmlFor="splitter">
      Your <a className={styles.link} href="https://strike.me/download">Strike</a> username
      </label>
      <input
        className={formStyles.input}
        id="splitter"
        type="text"
        disabled={isDisabled}
        placeholder="jack"
        value={user}
        onChange={(ev) => changeUser(ev.target.value)}
      />
      <span className={formStyles.inputIcon}>{getIcon(users[user])}</span>
    </div>
  )
}

type Currency = {
  currency: string
}

const CreateSplit = () => {
  const [error, setError] = useState()
  const [searchedUser, setSearchedUser] = useState('')
  const validUsers = useRef(new Set())
  const [userCurrencies, setUserCurrencies] = useState<Record<string, Currency[]>>({})
  const [user, setUser] = useState()
  const [people, setPeople] = useState('')
  const [includeOwner, setIncludeOwner] = useState(true)
  const [amount, setAmount] = useState('21')
  const [description, setDescription] = useState('dinner')
  const [currency, setCurrency] = useState<string>()
  const [isCreatingSplit, setIsCreatingSplit] = useState(false)

  const currencies = userCurrencies[searchedUser]

  const hasUser = validUsers.current.has(searchedUser)
  const actualPeople = people.split(',').map((s) => s.trim()).filter((s) => s !== '')
  const isSplitComplete = hasUser && actualPeople.length >= 1

  const onUserChange = (name: string) => {
    setSearchedUser(name)
    const currencies = userCurrencies[name]
    if (currencies) {
      setCurrency(currencies[0]?.currency)
    }
  }

  const onUser = (user: any) => {
    const { username, currencies } = user
    validUsers.current.add(username)
    setUserCurrencies({...userCurrencies, [username]: currencies })
  }

  const buttonStyle = isCreatingSplit ? { cursor: 'wait' } : {}

  return (
    <form className={formStyles.form}>
      <div className={formStyles.inputRow}>
        <SearchUser isDisabled={isCreatingSplit} onUser={onUser} onUserChange={onUserChange} />
      </div>

      <div className={formStyles.inputRow}>
        <label className={formStyles.label} htmlFor="amount">Amount to split</label>
        <div className={styles.amount}>
          <select
            className={formStyles.select}
            id="currency"
            value={currency}
            disabled={!hasUser || currencies && currencies.length === 1 || isCreatingSplit}
            onChange={(ev) => setCurrency(ev.target.value)}>
            {currencies && currencies.map(({ currency }) => <option key={currency} value={currency}>{currency}</option>)}
          </select>
          <input
            className={formStyles.input}
            id="amount"
            type="number"
            step="any"
            disabled={!hasUser || isCreatingSplit}
            value={amount}
            onChange={(ev) => setAmount(ev.target.value)}
          />
        </div>
      </div>

      <div className={formStyles.inputRow}>
        <label className={formStyles.label} htmlFor="people">Split among you and (separate names by commas)</label>
        <input
          className={formStyles.input}
          id="people"
          type="text"
          disabled={!hasUser || isCreatingSplit}
          placeholder="laura, manuela"
          value={people}
          onChange={(ev) => setPeople(ev.target.value) }
        />
      </div>

      <div className={styles.includeOwner}>
        <div className={styles.inputRow}>
          <input 
            className={formStyles.checkbox}
            id="include-yourself"
            type="checkbox"
            checked={includeOwner}
            onChange={() => setIncludeOwner(!includeOwner)}
          />
        </div>
        <div>
          <label className={formStyles.label} htmlFor="include-yourself">Include yourself</label>
        </div>
      </div>

      <div className={formStyles.inputRow}>
        <label className={formStyles.label} htmlFor="description">For</label>
        <input
          className={formStyles.input}
          id="description"
          type="text"
          disabled={!hasUser || isCreatingSplit}
          placeholder="e.g. pizza"
          value={description}
          onChange={(ev) => setDescription(ev.target.value) }
        />
      </div>

      <div className={formStyles.buttonRow}>
        <button
          className={formStyles.button}
          style={buttonStyle}
          type="button"
          disabled={!isSplitComplete || isCreatingSplit}
          onClick={(ev) => {
            setIsCreatingSplit(true)
            fetch(`/api/split`, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ user: searchedUser, amount: Number(amount), currency, people: actualPeople, description, includeOwner })
            })
            .then((r) => r.json())
            .then(({ id }) => {
              if (id) {
                window.location.assign(`/split/${id}`)
              }
            }).catch((err) => {
              setIsCreatingSplit(false)
              console.error(err)
            })
          }}
        >
          Split evenly
        </button>
      </div>
    </form>

  )

}

export default CreateSplit
