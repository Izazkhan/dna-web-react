import React from 'react';

const ActiveOffers = ({ 
  proposals, 
  influencers, 
  searchCampaign, 
  getInfluencers, 
  sortInfluencers, 
  getMoreInfluencers, 
  loadMore, 
  adCampaignInfluencerAnalytics, 
  influencerProfilePicture, 
  sharedState, 
  imgError 
}) => {
  return (
    <div className="row m-0 justify-content-center">
      <div className="col-md-8 col-12 layout-container" id="active-offers-app">
        {/* Search Header */}
        <div className="card bd-bottom">
          <div className="card-header p-3">
            <div className="input-group search">
              <div className="input-group-prepend">
                <span className="input-group-text border-0">
                  <i className="search-icon"></i>
                </span>
              </div>
              <input 
                type="text" 
                className="form-control outline-0 border-0 search-box" 
                onChange={searchCampaign} 
                placeholder="Search here" 
              />
            </div>
          </div>
        </div>

        {/* Proposals List */}
        {proposals.map((proposal, index) => (
          <div className="accordion cursor-hand" key={proposal.id} id={`offerAccordion${proposal.id}`}>
            <div className="card offer bd-bottom">
              <div 
                className="card-header clickable bg-white" 
                id={`offerHeading${proposal.id}`} 
                onClick={() => getInfluencers(index, proposal.id)}
                data-toggle="collapse" 
                data-target={`#offerCollapse${proposal.id}`} 
                aria-expanded="false" 
                aria-controls={`offerCollapse${proposal.id}`}
              >
                <div className="d-flex align-items-center">
                  <div className="flex-grow-1 text-ellipsis">
                    <div className="d-flex">
                      <div className="collapse-title text-ellipsis">
                        {proposal.name}
                      </div>
                      <span className="collapse-title pr-2">
                        &nbsp;({proposal.ad_campaign_igb_account_user_count})
                      </span>
                    </div>
                  </div>
                  <i className="header-icon chevron-right-icon"></i>
                </div>
              </div>

              {/* Collapsable Body */}
              <div 
                id={`offerCollapse${proposal.id}`} 
                className="collapse this-collapsable" 
                aria-labelledby={`offerHeading${proposal.id}`} 
                data-parent={`#offerAccordion${proposal.id}`}
              >
                <div className="card-body p-0">
                  <div className="card bd-top">
                    <div className="card-body pl-3 pb-3 pt-3">
                      <select 
                        className="sorting-list border-0 bg-white" 
                        id={`sorting-list${proposal.id}`} 
                        onChange={() => sortInfluencers(index, proposal.id)}
                      >
                        <option value="engagement">Sort by Avg Engagment</option>
                        <option value="followers_count">Sort by Followers</option>
                      </select>
                    </div>
                  </div>

                  <div className="list">
                    {influencers[index] && influencers[index].map((influencer) => (
                      <div className="card influencer" key={influencer.igb_account_id}>
                        <div className="card-header p-0">
                          <a 
                            className="text-decoration-none" 
                            href={adCampaignInfluencerAnalytics(influencer.ad_campaign_id, influencer.igb_account_id, influencer.user_id)}
                          >
                            <div className="d-flex">
                              <div className="user-avatar float-left pt-2 pl-3">
                                <img 
                                  src={sharedState.placeholderUrl} 
                                  data-src={influencerProfilePicture(influencer.igb_account, 34)} 
                                  className="img-circle lozad" 
                                  onError={imgError} 
                                  data-avatar={influencer.igb_account.username} 
                                  width="34px" 
                                  alt={influencer.igb_account.name}
                                />
                              </div>
                              <div className="flex-grow-1 bd-top ml-2 pb-2 pt-2">
                                <div className="mb-0 user">
                                  <div className="name">{influencer.igb_account.name}</div>
                                  <small className="status">{influencer.igb_account.username}</small>
                                </div>
                              </div>
                              <div className="pt-3 pr-3 bd-top pb-2">
                                <i className="header-icon chevron-right-icon"></i>
                              </div>
                            </div>
                          </a>
                        </div>
                      </div>
                    ))}

                    <div className="card">
                      <div className="card-body m-0 d-flex align-items-center">
                        <button 
                          className="btn loadmore outline-0 mt-2" 
                          onClick={() => getMoreInfluencers(index, proposal.id)}
                        >
                          Load More Influencers
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Global Pagination */}
        {proposals.length > 0 && (
          <div className="card">
            <div className="card-body d-flex align-items-center">
              <button className="btn outline-0 loadmore mt-2" onClick={loadMore}>
                Load More
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {proposals.length === 0 && (
          <div className="card">
            <div className="card-body">
              <div className="empty-list">No active proposals found.</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveOffers;