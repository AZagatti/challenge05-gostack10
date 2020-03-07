import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

import Container from '../../components/Container';
import api from '../../services/api';
import { Loading, Owner, IssueList, ButtonWrapper, Button } from './styles';

class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  state = {
    repository: {},
    issues: [],
    loading: true,
    page: 1,
    issueState: 'all',
  };

  async componentDidMount() {
    const { match } = this.props;
    const { page } = this.state;

    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: 'all',
          page,
        },
      }),
    ]);

    this.setState({
      repository: repository.data,
      issues: issues.data,
      loading: false,
    });
  }

  async componentDidUpdate(_, prevState) {
    const { issueState, page } = this.state;
    if (prevState.issueState !== issueState || prevState.page !== page) {
      const { match } = this.props;

      const repoName = decodeURIComponent(match.params.repository);

      const issues = await api.get(`/repos/${repoName}/issues`, {
        params: {
          state: issueState,
          page,
        },
      });

      this.handleUpdateIssues(issues);
    }
  }

  handleUpdateIssues = issues => {
    this.setState({
      issues: issues.data,
    });
  };

  render() {
    const { repository, issues, loading, page } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }

    return (
      <Container>
        <Owner>
          <Link to="/">Voltar aos repositórios</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>

        <ButtonWrapper>
          <Button
            type="button"
            color="#7159c1"
            onClick={() => this.setState({ issueState: 'all' })}
          >
            Todas
          </Button>
          <Button
            type="button"
            color="#0bb836"
            onClick={() => this.setState({ issueState: 'open' })}
          >
            Abertas
          </Button>
          <Button
            type="button"
            color="#b80b0b"
            onClick={() => this.setState({ issueState: 'closed' })}
          >
            Fechadas
          </Button>
        </ButtonWrapper>

        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a
                    href={issue.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {issue.title}
                  </a>
                  {issue.labels.map(label => (
                    <span key={String(label.id)}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>

        <ButtonWrapper>
          <Button
            color="#7159c1"
            disabled={page === 1}
            onClick={() => this.setState(state => ({ page: state.page - 1 }))}
          >
            <FaAngleLeft color="#FFF" size={24} />
          </Button>
          <Button
            color="#7159c1"
            disabled={!issues.length > 0}
            onClick={() => this.setState(state => ({ page: state.page + 1 }))}
          >
            <FaAngleRight color="#FFF" size={24} />
          </Button>
        </ButtonWrapper>
      </Container>
    );
  }
}

export default Repository;
